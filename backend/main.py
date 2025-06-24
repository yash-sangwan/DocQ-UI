from __future__ import annotations

import os
import time
import uuid
import tempfile
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llama_index.core import (
    Settings,
    StorageContext,
    VectorStoreIndex,
    SimpleDirectoryReader,
)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.prompts import PromptTemplate
from llama_index.llms.ollama import Ollama

import qdrant_client
from qdrant_client.http import models as rest
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("rag-server")

# Globals
sessions: Dict[str, Dict[str, Any]] = {}
embed_model: HuggingFaceEmbedding | None = None
llm: Ollama | None = None
qdrant_client_instance: qdrant_client.QdrantClient | None = None

# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    custom_prompt: str | None = None


class UploadRequest(BaseModel):
    custom_prompt: str | None = None


class UploadResponse(BaseModel):
    session_id: str
    message: str


class QuestionResponse(BaseModel):
    content: str


# Startup helpers
async def initialize_models() -> None:
    """Load Ollama, embeddings (CPU) and connect to Qdrant."""
    global embed_model, llm, qdrant_client_instance

    load_dotenv()

    # LLM
    llm = Ollama(
        base_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
        model="llama3.1:8b",
        request_timeout=60.0,
    )

    # Embeddings – forced to CPU
    try:
        embed_model = HuggingFaceEmbedding(
            model_name="BAAI/bge-large-en", device="cpu"
        )
    except RuntimeError:
        embed_model = HuggingFaceEmbedding(
            model_name="BAAI/bge-base-en-v1.5", device="cpu"
        )

    Settings.llm = llm
    Settings.embed_model = embed_model

    # Qdrant
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api = os.getenv("QDRANT_API", "")

    if not qdrant_url:
        raise ValueError("QDRANT_URL not set")

    qdrant_client_instance = qdrant_client.QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api or None,
        https=True,
        port=443,
        prefer_grpc=False,
        timeout=60.0,
    )
    qdrant_client_instance.get_collections()
    logger.info("Connected to Qdrant")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initialising models")
    await initialize_models()
    logger.info("Server ready")
    yield
    logger.info("Shutdown complete")

# FastAPI app
app = FastAPI(title="RAG Document Assistant", version="1.0.0", lifespan=lifespan)

origins_cfg = [o.strip() for o in os.getenv("ALLOWED_ORIGIN", "*").split(",")]
wildcard = origins_cfg == ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if wildcard else origins_cfg,
    allow_credentials=not wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Internal helpers
def _create_collection(name: str) -> None:
    """Create Qdrant collection if it does not exist."""
    assert qdrant_client_instance and embed_model
    current = {c.name for c in qdrant_client_instance.get_collections().collections}
    if name in current:
        return

    dim = len(embed_model.get_query_embedding("dimension-check"))
    qdrant_client_instance.create_collection(
        collection_name=name,
        vectors_config=rest.VectorParams(size=dim, distance=rest.Distance.COSINE),
        optimizers_config=rest.OptimizersConfigDiff(memmap_threshold=20_000),
    )
    logger.info("Created collection %s", name)


def _build_index(files_data: List[bytes], session_id: str) -> VectorStoreIndex:
    """Embed and index PDFs into Qdrant."""
    assert qdrant_client_instance
    tmp_dir = tempfile.mkdtemp(prefix=f"session_{session_id}_")
    try:
        # Save files
        for idx, data in enumerate(files_data):
            with open(os.path.join(tmp_dir, f"doc_{idx}.pdf"), "wb") as fp:
                fp.write(data)

        # Load and split
        docs = SimpleDirectoryReader(tmp_dir, required_exts=[".pdf"]).load_data()
        splitter = SentenceSplitter(chunk_size=150, chunk_overlap=40)
        nodes = splitter.get_nodes_from_documents(docs)

        # Vector store
        coll = f"session_{session_id}"
        _create_collection(coll)
        store = QdrantVectorStore(client=qdrant_client_instance, collection_name=coll)
        ctx = StorageContext.from_defaults(vector_store=store)
        return VectorStoreIndex(nodes, storage_context=ctx)
    finally:
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)


def _make_engine(index: VectorStoreIndex, custom_prompt: str | None) -> RetrieverQueryEngine:
    """Return a RetrieverQueryEngine with reranking."""
    retriever = VectorIndexRetriever(index=index, similarity_top_k=30)

    model_name = "cross-encoder/ms-marco-MiniLM-L-12-v2"
    try:
        reranker = SentenceTransformerRerank(top_n=12, model=model_name)
    except TypeError:
        reranker = SentenceTransformerRerank(model_name, 8)

    prompt = custom_prompt or (
        "You are a helpful assistant. Rely **only** on the information supplied in <context>. "
        "Answer clearly and copy any figures or exact wording exactly as they appear in the source.\n\n"
        "If the context does not contain the requested fact or number, reply 'Not specified in the document'.\n\n"
    )

    template = PromptTemplate(
        template=f"{prompt}\n\n<context>\n{{context_str}}\n</context>\n\nQ: {{query_str}}\nA:"
    )

    return RetrieverQueryEngine.from_args(
        retriever=retriever,
        llm=llm,
        node_postprocessors=[reranker],
        response_mode="compact",
        text_qa_template=template,
    )

# API routes
@app.post("/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="no files provided")
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"{f.filename} is not a PDF")

    session_id = str(uuid.uuid4())
    index = _build_index([await f.read() for f in files], session_id)

    sessions[session_id] = {
        "index": index,
        "created_at": time.time(),
        "file_count": len(files),
        "file_names": [f.filename for f in files],
        "custom_prompt": None,
    }
    return UploadResponse(session_id=session_id, message="documents processed")


@app.post("/ask/{session_id}", response_model=QuestionResponse)
async def ask_question(session_id: str, request: QuestionRequest):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="session not found")
    data = sessions[session_id]
    engine = _make_engine(data["index"], request.custom_prompt or data["custom_prompt"])
    result = engine.query(request.question)
    return QuestionResponse(content=str(result.response))


@app.post("/sessions/{session_id}/prompt")
async def set_prompt(session_id: str, req: UploadRequest):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="session not found")
    sessions[session_id]["custom_prompt"] = req.custom_prompt
    return {"message": "prompt updated"}


@app.get("/sessions/{session_id}")
async def session_meta(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="session not found")
    return {**sessions[session_id], "session_id": session_id}


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="session not found")
    collection = f"session_{session_id}"
    try:
        qdrant_client_instance.delete_collection(collection)  
    except Exception as exc:
        logger.error("Failed to delete collection %s: %s", session_id, exc)
    sessions.pop(session_id, None)
    return {"message": "session deleted"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "active_sessions": len(sessions),
        "models_loaded": embed_model is not None and llm is not None,
    }

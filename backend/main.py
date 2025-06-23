import os, uuid
from pathlib import Path
from typing import Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from rich.console import Console

from llama_index.core import Settings, VectorStoreIndex, SimpleDirectoryReader, PromptTemplate
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.llms.ollama import Ollama

console = Console()
load_dotenv(".env")

llm = Ollama(base_url=os.getenv("OLLAMA_URL"), model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"), request_timeout=60)

try:
    embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-large-en")
    embed_model.embed_query("ping")
except Exception as e:
    console.print(f"[yellow]GPU embeddings failed ({e}) – using CPU[/]")
    embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-base-en-v1.5", device="cpu")

Settings.llm = llm
Settings.embed_model = embed_model

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

QA_PROMPT = PromptTemplate(
    template=(
        "You are an academic advisor for the IIT-Madras BS programme.\n"
        "Quote numbers exactly as shown in the context.\n\n"
        "<context>\n{context_str}\n</context>\n\n"
        "Q: {query_str}\nA:"
    )
)

SESSIONS: Dict[str, RetrieverQueryEngine] = {}

app = FastAPI(title="Multi-PDF RAG Demo")

if origin := os.getenv("ALLOWED_ORIGIN"):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def build_engine(pdf_dir: Path) -> RetrieverQueryEngine:
    docs = SimpleDirectoryReader(str(pdf_dir), required_exts=[".pdf"]).load_data()
    if not docs:
        raise ValueError("No PDFs found")
    nodes = SentenceSplitter(chunk_size=150, chunk_overlap=40).get_nodes_from_documents(docs)
    index = VectorStoreIndex(nodes)
    retriever = VectorIndexRetriever(index=index, similarity_top_k=30)
    reranker = SentenceTransformerRerank(model="cross-encoder/ms-marco-MiniLM-L-12-v2", top_n=12)
    return RetrieverQueryEngine.from_args(retriever=retriever, node_postprocessors=[reranker], response_mode="compact", text_qa_template=QA_PROMPT, llm=llm)

@app.post("/upload")
async def upload(files: list[UploadFile] = File(...)):
    sid = uuid.uuid4().hex
    session_dir = UPLOADS_DIR / sid
    session_dir.mkdir(parents=True, exist_ok=True)
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(400, detail="Only PDF files are accepted")
        (session_dir / f.filename).write_bytes(await f.read())
    try:
        SESSIONS[sid] = build_engine(session_dir)
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to build index: {e}")
    console.print(f"[green]✓  Session {sid} ready with {len(files)} PDF(s)[/]")
    return {"session_id": sid}

@app.post("/ask/{sid}")
async def ask(sid: str, body: Any = Body(...)):
    engine = SESSIONS.get(sid)
    if not engine:
        raise HTTPException(404, detail="Invalid session_id")
    q = body if isinstance(body, str) else body.get("question") or body.get("query")
    if not q:
        raise HTTPException(422, detail="Field 'question' missing")
    try:
        return {"content": engine.query(q).response}
    except Exception as e:
        console.print(f"[red]Query error: {e}[/]")
        raise HTTPException(500, detail="Query failed")

@app.get("/info")
def info():
    return {"active_sessions": len(SESSIONS), "ollama_model": os.getenv("OLLAMA_MODEL", "llama3.1:8b")}

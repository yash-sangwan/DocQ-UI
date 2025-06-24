"use client";

import {
  X,
  Settings,
  UploadCloud,
  Bot,
  FileText,
  Scissors,
  BrainCircuit,
  Database,
  Search,
  ListFilter,
  Sparkles,
  MessageSquare,
  ChevronRight,
  MousePointerSquareDashed,
} from "lucide-react";
import React from "react";

// --- Helper Components for the Flowchart ---

interface FlowNodeProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const FlowNode = ({ icon, title, subtitle }: FlowNodeProps) => (
  <div
    className="flex w-full items-center gap-3 rounded-lg p-3 transition-all"
    style={{
      backgroundColor: "var(--bg-tertiary)",
    }}
  >
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
      style={{
        background: "linear-gradient(135deg, var(--bg-surface), var(--bg-highlight))",
        color: "var(--primary-green)",
      }}
    >
      {icon}
    </div>
    <div>
      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
        {subtitle}
      </p>
    </div>
  </div>
);

const FlowArrow = () => (
  <div className="my-2 h-8 w-full text-center" style={{ color: "var(--text-disabled)" }}>
    <ChevronRight size={24} className="mx-auto rotate-90" />
  </div>
);

// --- Internal "Behind the Scenes" Component ---

const BehindTheScenesFlow = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm rounded-xl p-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <h4 className="mb-4 text-center text-lg font-bold text-gradient">Data Ingestion</h4>
        <div className="flex flex-col items-center">
          <FlowNode icon={<FileText size={22} />} title="Load PDF" subtitle="Select your documents" />
          <FlowArrow />
          <FlowNode icon={<Scissors size={22} />} title="Text Splitting" subtitle="Breaking down into chunks" />
          <FlowArrow />
          <FlowNode icon={<BrainCircuit size={22} />} title="Embeddings" subtitle="Creating vector representations" />
          <FlowArrow />
          <FlowNode icon={<Database size={22} />} title="Index in Qdrant" subtitle="Storing in a vector database" />
        </div>
      </div>
      
      <div className="my-6 h-12 w-1 rounded-full" style={{ background: "linear-gradient(var(--bg-tertiary), var(--primary-green), var(--bg-tertiary))" }} />

      <div className="w-full max-w-sm rounded-xl p-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <h4 className="mb-4 text-center text-lg font-bold text-gradient">Query & Response</h4>
        <div className="flex flex-col items-center">
          <FlowNode icon={<Search size={22} />} title="User Query" subtitle="Asking your question" />
          <FlowArrow />
          <FlowNode icon={<Database size={22} />} title="Vector Search" subtitle="Finding relevant chunks (Top 30)" />
          <FlowArrow />
          <FlowNode icon={<ListFilter size={22} />} title="Rerank" subtitle="Refining results (Top 12)" />
          <FlowArrow />
          <FlowNode icon={<Sparkles size={22} />} title="Generate" subtitle="Creating the answer with Llama 3.1" />
          <FlowArrow />
          <FlowNode icon={<MessageSquare size={22} />} title="Answer" subtitle="Delivering the final response" />
        </div>
      </div>
    </div>
  );
};

// --- Main Exported Help Sheet Component ---

interface HelpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSheet = ({ isOpen, onClose }: HelpSheetProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-6xl h-[90vh] max-h-[800px] bg-bg-secondary rounded-2xl shadow-2xl z-50 flex flex-col p-2 fade-in"
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex-shrink-0 p-4 flex items-center justify-between border-b" style={{borderColor: 'var(--border-secondary)'}}>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-3">
            <MousePointerSquareDashed size={24} />
            <span>Application Guide</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all duration-200 hover:bg-bg-tertiary focus-ring"
            aria-label="Close help"
          >
            <X size={22} style={{ color: "var(--text-secondary)" }}/>
          </button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Side: Getting Started */}
          <div className="flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-semibold mb-6">Getting Started</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 flex items-center justify-center w-10 h-10 rounded-full" style={{backgroundColor: 'var(--primary-green)', color: 'var(--bg-primary)'}}>
                  <span className="font-bold text-lg">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1" style={{color: 'var(--text-primary)'}}>Upload Your Documents</h4>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Click the <Settings size={16} className="inline -mt-1 mx-1"/> <strong>Settings</strong> icon in the sidebar. Here, you can upload one or more PDF files to create a knowledge base for the AI to work with.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 flex items-center justify-center w-10 h-10 rounded-full" style={{backgroundColor: 'var(--primary-green)', color: 'var(--bg-primary)'}}>
                  <span className="font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1" style={{color: 'var(--text-primary)'}}>Set the System Prompt</h4>
                  <p style={{ color: "var(--text-secondary)" }}>
                    In the same <Bot size={16} className="inline -mt-1 mx-1"/> <strong>Settings</strong> panel, you can define a custom system prompt. This acts as a set of instructions, guiding the AI on its personality, tone, and how it should respond to your questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Behind the Scenes */}
          <div className="bg-bg-secondary p-6 overflow-y-auto custom-scrollbar border-t md:border-t-0 md:border-l" style={{borderColor: 'var(--border-primary)'}}>
             <h3 className="text-xl font-semibold mb-6 text-center">Behind the Scenes</h3>
            <BehindTheScenesFlow />
          </div>
        </div>
      </div>
    </>
  );
};
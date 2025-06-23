import {
  FileText,
  Scissors,
  BrainCircuit,
  Database,
  Search,
  ListFilter,
  Sparkles,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import React from "react";

interface FlowNodeProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const FlowNode = ({ icon, title, subtitle }: FlowNodeProps) => (
  <div
    className="flex-shrink-0 w-36 text-center p-3 rounded-lg flex flex-col items-center gap-1 transition-all"
    style={{
      backgroundColor: "var(--bg-tertiary)",
      border: "1px solid var(--border-primary)",
    }}
  >
    <div style={{ color: "var(--text-tertiary)" }}>{icon}</div>
    <h3
      className="font-semibold"
      style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
    >
      {title}
    </h3>
    <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
      {subtitle}
    </p>
  </div>
);

const FlowArrow = () => (
  <div className="flex-shrink-0" style={{ color: "var(--text-disabled)" }}>
    <ChevronRight size={20} />
  </div>
);

const EmptyStateChat = () => {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-4 md:p-6 text-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
        
      <div className="mb-10 ">
        <h2
          className="text-4xl md:text-6xl  font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Ready to dive in?
        </h2>
        <p
          className="mt-4 text-sm md:text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Ask your first question to get started.
        </p>
    
      </div>

      <div className="hidden lg:block opacity-40">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <FlowNode
              icon={<FileText size={20} />}
              title="Load PDF"
              subtitle="From 'docs/'"
            />
            <FlowArrow />
            <FlowNode
              icon={<Scissors size={20} />}
              title="Text Splitting"
              subtitle="Chunking"
            />
            <FlowArrow />
            <FlowNode
              icon={<BrainCircuit size={20} />}
              title="Embeddings"
              subtitle="BGE-large"
            />
            <FlowArrow />
            <FlowNode
              icon={<Database size={20} />}
              title="Index in Qdrant"
              subtitle="Vector Store"
            />
          </div>
        </div>

        <div
          className="w-px h-6 my-3 mx-auto"
          style={{ backgroundColor: "var(--border-primary)" }}
        ></div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <FlowNode
              icon={<Search size={20} />}
              title="User Query"
              subtitle="Your question"
            />
            <FlowArrow />
            <FlowNode
              icon={<Database size={20} />}
              title="Vector Search"
              subtitle="Top 30"
            />
            <FlowArrow />
            <FlowNode
              icon={<ListFilter size={20} />}
              title="Rerank"
              subtitle="Top 12"
            />
            <FlowArrow />
            <FlowNode
              icon={<Sparkles size={20} />}
              title="Generate"
              subtitle="Llama 3.1"
            />
            <FlowArrow />
            <FlowNode
              icon={<MessageSquare size={20} />}
              title="Answer"
              subtitle="Response"
            />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EmptyStateChat;

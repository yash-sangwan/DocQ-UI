import { ReactNode, useState, useCallback, useRef } from "react";
import {
  X,
  FileUp,
  MessageCircle,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { uploadPdfs } from "@/lib/api";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionReady?: (sessionId: string) => void;
}

const SidebarButton = ({
  icon,
  label,
  onClick,
  isActive,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
    }}
    className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sm transition-colors duration-200 hover:bg-[var(--hover-overlay)] hover:text-[var(--text-primary)]"
  >
    {icon}
    <span>{label}</span>
  </button>
);

export function SettingsSheet({
  isOpen,
  onClose,
  onSessionReady,
}: SettingsSheetProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "prompts">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "You are an academic advisor for the IIT-Madras BS programme.\nQuote numbers exactly as shown in the context.",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl);
    const valids = arr.filter((f) => f.type === "application/pdf");
    setError(valids.length === arr.length ? null : "Only PDF files are allowed.");
    setFiles((prev) => [...prev, ...valids]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) setError(null);
      return next;
    });
  };

  const handleUpload = async () => {
    if (!files.length) {
      setError("Please select at least one PDF file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const { session_id } = await uploadPdfs(files);
      onSessionReady?.(session_id);
      onClose();
    } catch {
      setError("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm">
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
        className="rounded-xl shadow-2xl w-full max-w-3xl flex overflow-hidden h-[600px]"
      >
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-primary)",
          }}
          className="w-1/3 p-4 space-y-2 border-r"
        >
          <SidebarButton
            icon={<FileUp size={16} />}
            label="Upload PDFs"
            onClick={() => setActiveTab("upload")}
            isActive={activeTab === "upload"}
          />
          <SidebarButton
            icon={<MessageCircle size={16} />}
            label="Prompts"
            onClick={() => setActiveTab("prompts")}
            isActive={activeTab === "prompts"}
          />
        </div>
        <div className="flex-1 relative p-8 flex flex-col">
          <button
            onClick={onClose}
            style={{ color: "var(--text-tertiary)" }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--hover-overlay)] transition-colors"
          >
            <X size={20} />
          </button>
          {activeTab === "upload" && (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                Upload Documents
              </h2>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                style={{
                  borderColor: isDragging
                    ? "var(--border-focus)"
                    : "var(--border-secondary)",
                  backgroundColor: isDragging
                    ? "var(--bg-tertiary)"
                    : "transparent",
                }}
                className="flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-6 transition-colors"
              >
                <UploadCloud
                  size={48}
                  className="text-[var(--text-tertiary)] mb-4"
                />
                <p className="text-lg font-medium text-[var(--text-secondary)]">
                  Drag & drop your PDFs here
                </p>
                <p className="text-[var(--text-tertiary)]">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: "var(--primary-green)",
                    color: "var(--text-primary)",
                  }}
                  className="mt-2 px-4 py-2 rounded-lg hover:bg-[var(--primary-green-hover)] transition-colors"
                >
                  Browse Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  accept=".pdf"
                  multiple
                />
              </div>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {files.map((f, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                    className="flex items-center justify-between p-2 rounded-lg"
                  >
                    <span className="text-sm text-[var(--text-secondary)] truncate">
                      {f.name}
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-[var(--error)] hover:opacity-80 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div
                style={{ borderColor: "var(--border-primary)" }}
                className="mt-auto pt-4 border-t flex items-center justify-between"
              >
                {error && (
                  <p className="text-sm text-[var(--error)]">{error}</p>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!files.length || uploading}
                  style={{
                    backgroundColor: "var(--success)",
                    color: "var(--text-primary)",
                  }}
                  className="px-6 py-2 rounded-lg hover:bg-[var(--primary-green-hover)] disabled:bg-[var(--bg-highlight)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed"
                >
                  {uploading
                    ? "Uploading…"
                    : `Upload ${files.length} File(s)`}
                </button>
              </div>
            </div>
          )}
          {activeTab === "prompts" && (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                Customize AI Prompt
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Define how the AI should respond to guide its answers.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
                className="w-full flex-1 p-4 border rounded-lg resize-none"
              />
              <div
                style={{ borderColor: "var(--border-primary)" }}
                className="mt-auto pt-4 border-t flex justify-end"
              >
                <button
                  style={{
                    backgroundColor: "var(--primary-green)",
                    color: "var(--text-primary)",
                  }}
                  className="px-6 py-2 rounded-lg hover:bg-[var(--primary-green-hover)]"
                >
                  Save Prompt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
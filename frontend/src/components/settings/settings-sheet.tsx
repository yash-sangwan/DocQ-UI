import { ReactNode, useState, useCallback, useRef } from "react";
import { X, FileUp, MessageCircle, UploadCloud, Trash2, Menu } from "lucide-react";
import { uploadPdfs, updateSessionPrompt } from "@/lib/api";

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
    className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sm transition-colors duration-200 hover:bg-[var(--hover-overlay)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
  >
    {icon}
    <span className="truncate">{label}</span>
  </button>
);

export default function SettingsSheet({
  isOpen,
  onClose,
  onSessionReady,
}: SettingsSheetProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "prompts">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "You are a helpful assistant. Rely **only** on the information supplied in <context>. " +
      "Answer clearly and copy any figures or exact wording exactly as they appear in the source.\n\n" +
      "If the context does not contain the requested fact or number, reply 'Not specified in the document'.\n\n"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    clearMessages();
    
    const arr = Array.from(fl);
    const valids = arr.filter((f) => f.type === "application/pdf");
    
    if (valids.length !== arr.length) {
      setError("Only PDF files are allowed.");
      return;
    }

    // Check file sizes (10MB limit per file)
    const oversized = valids.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      setError(`Files too large: ${oversized.map(f => f.name).join(', ')}. Maximum size is 10MB per file.`);
      return;
    }

    setFiles((prev) => [...prev, ...valids]);
  }, [clearMessages]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) {
        clearMessages();
      }
      return next;
    });
  }, [clearMessages]);

  const handleUpload = async () => {
    if (!files.length) {
      setError("Please select at least one PDF file to upload.");
      return;
    }

    if (files.length > 5) {
      setError("Maximum 5 files allowed per upload.");
      return;
    }

    setUploading(true);
    clearMessages();
    
    try {
      const response = await uploadPdfs(files, prompt);
      setCurrentSessionId(response.session_id);
      setSuccess(`Successfully uploaded ${files.length} file(s). Session created: ${response.session_id}`);
      onSessionReady?.(response.session_id);
      
      // Clear files after successful upload
      setFiles([]);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        "An error occurred during upload. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!currentSessionId) {
      setError("No active session. Please upload documents first.");
      return;
    }

    setSavingPrompt(true);
    clearMessages();

    try {
      await updateSessionPrompt(currentSessionId, prompt);
      setSuccess("Prompt updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Save prompt error:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        "Failed to save prompt. Please try again."
      );
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleTabChange = (tab: "upload" | "prompts") => {
    setActiveTab(tab);
    setShowMobileSidebar(false);
    clearMessages();
  };

  const handleClose = () => {
    // Reset state when closing
    setFiles([]);
    setActiveTab("upload");
    setShowMobileSidebar(false);
    clearMessages();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 fade-in" 
         style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
      <div 
        className="rounded-xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:h-[600px]"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4"
             style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 rounded-lg hover:bg-[var(--hover-overlay)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <Menu size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {activeTab === "upload" ? "Upload Documents" : "Customize AI Prompt"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--hover-overlay)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <X size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Sidebar */}
        <div className={`${
          showMobileSidebar ? 'block slide-in-left' : 'hidden'
        } md:block w-full md:w-80 lg:w-1/3 p-4 space-y-2 ${
          showMobileSidebar ? '' : 'md:border-r'
        }`}
        style={{ 
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}>
          <SidebarButton
            icon={<FileUp size={16} />}
            label="Upload PDFs"
            onClick={() => handleTabChange("upload")}
            isActive={activeTab === "upload"}
          />
          <SidebarButton
            icon={<MessageCircle size={16} />}
            label="Prompts"
            onClick={() => handleTabChange("prompts")}
            isActive={activeTab === "prompts"}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 relative p-4 md:p-8 flex flex-col min-h-0">
          {/* Desktop Close Button */}
          <button
            onClick={handleClose}
            className="hidden md:block absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--hover-overlay)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <X size={20} style={{ color: "var(--text-tertiary)" }} />
          </button>

          {/* Success/Error Messages */}
          {(error || success) && (
            <div className={`mb-4 p-3 rounded-lg text-sm message-enter ${
              error ? 'border border-red-500/20' : 'border border-green-500/20'
            }`}
            style={{ 
              backgroundColor: error ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 163, 127, 0.1)",
              color: error ? "var(--error)" : "var(--success)"
            }}>
              {error || success}
            </div>
          )}

          {activeTab === "upload" && (
            <div className="h-full flex flex-col">
              <h2 className="hidden md:block text-2xl font-semibold mb-4" 
                  style={{ color: "var(--text-primary)" }}>
                Upload Documents
              </h2>
              
              {/* Upload Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className="flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 md:p-6 transition-all duration-200 min-h-[200px] cursor-pointer"
                style={{
                  borderColor: isDragging ? "var(--border-focus)" : "var(--border-secondary)",
                  backgroundColor: isDragging ? "var(--bg-tertiary)" : "transparent"
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud
                  size={48}
                  className="mb-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <p className="text-lg font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Drag & drop your PDFs here
                </p>
                <p className="mb-4" style={{ color: "var(--text-tertiary)" }}>or</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base btn-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  style={{ 
                    backgroundColor: "var(--primary-green)",
                    color: "var(--text-primary)"
                  }}
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
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                  Maximum 5 files, 10MB each
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-32 md:max-h-48 overflow-y-auto">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 md:p-3 rounded-lg"
                      style={{ backgroundColor: "var(--bg-tertiary)" }}
                    >
                      <div className="flex-1 mr-2">
                        <span className="text-sm truncate block" style={{ color: "var(--text-secondary)" }}>
                          {f.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="p-1 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded"
                        style={{ color: "var(--error)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3"
                   style={{ borderTop: "1px solid var(--border-primary)" }}>
                <button
                  onClick={handleUpload}
                  disabled={!files.length || uploading}
                  className="w-full sm:w-auto px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed btn-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: files.length && !uploading ? "var(--success)" : "var(--bg-highlight)",
                    color: files.length && !uploading ? "var(--text-primary)" : "var(--text-disabled)"
                  }}
                >
                  {uploading && (
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  )}
                  {uploading ? "Uploading…" : `Upload ${files.length} File(s)`}
                </button>
              </div>
            </div>
          )}

          {activeTab === "prompts" && (
            <div className="h-full flex flex-col">
              <h2 className="hidden md:block text-2xl font-semibold mb-4" 
                  style={{ color: "var(--text-primary)" }}>
                Customize AI Prompt
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Define how the AI should respond to guide its answers.
              </p>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full flex-1 p-4 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[var(--focus-ring)] min-h-[200px] transition-all"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-secondary)"
                }}
                placeholder="Enter your custom prompt here..."
              />
              
              <div className="mt-4 pt-4 flex justify-end"
                   style={{ borderTop: "1px solid var(--border-primary)" }}>
                <button 
                  onClick={handleSavePrompt}
                  disabled={savingPrompt}
                  className="px-6 py-2 rounded-lg transition-colors btn-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center gap-2"
                  style={{
                    backgroundColor: "var(--primary-green)",
                    color: "var(--text-primary)"
                  }}
                >
                  {savingPrompt && (
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  )}
                  {savingPrompt ? "Saving..." : "Save Prompt"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react"
import { User, Bot, Copy, Check, RotateCw } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: number
}

interface Props {
  message: Message
  /** optional: wire up if you already expose a retry handler */
  onRegenerate?: () => void
}

export function MessageBubble({ message, onRegenerate }: Props) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2_000)
    } catch {/* ignore */}
  }

  /* ---- quick MD → HTML helper ---- */
  const fmt = (t: string) =>
    t
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, "<br />")

  return (
    <div
      className={`flex w-full mb-8 px-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* avatar + bubble wrapper */}
      <div
        className={`flex gap-4 items-start ${
          isUser ? "flex-row-reverse" : ""
        } max-w-5xl w-full`}
      >
        {/* avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isUser
              ? "var(--primary-green)"
              : "var(--bg-surface)",
            color: "var(--text-primary)",
          }}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* bubble / text */}
        <div className={`${isUser ? "max-w-[70%]" : "flex-1 max-w-[70%]"}`}>
          {isUser ? (
            <span
              className="inline-block px-4 py-2 rounded-2xl"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              {message.content}
            </span>
          ) : (
            <>
              <div
                className="prose prose-invert message-content"
                dangerouslySetInnerHTML={{ __html: fmt(message.content) }}
              />
              {/* copy + regenerate */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={copy}
                  aria-label="Copy reply"
                  className="p-1.5 rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>

                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    aria-label="Regenerate reply"
                    className="p-1.5 rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <RotateCw size={14} />
                  </button>
                )}
              </div>
            </>
          )}

          <div
            className={`text-xs mt-2 ${isUser ? "text-right" : ""}`}
            style={{ color: "var(--text-tertiary)" }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* scoped tweaks */}
      <style jsx>{`
        .inline-code {
          background: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.85em;
        }
      `}</style>
    </div>
  )
}

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"

interface ChatOptionsProps {
  onDelete: () => void
}

export function ChatOptions({ onDelete }: ChatOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  /* --- close when clicking elsewhere --- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  /* --- helpers --- */
  const handleDelete = () => {
    onDelete()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* kebab */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((p) => !p)
        }}
        className="p-1.5 rounded transition-colors"
        style={{
          color: "var(--text-tertiary)",
          backgroundColor: "var(--bg-surface)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        aria-label="Chat options"
      >
        <MoreHorizontal size={12} />
      </button>

      {/* dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-8 w-32 py-1 rounded-lg border shadow-lg z-50"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-primary)",
          }}
        >
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"
              e.currentTarget.style.color = "var(--error)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

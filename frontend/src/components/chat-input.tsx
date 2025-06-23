"use client"

import { useState, type FormEvent, useRef } from "react"
import { Send, Square } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any) // Cast to any to satisfy form event requirement
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200" 
               style={{ 
                 backgroundColor: 'var(--bg-surface)',
                 borderColor: 'var(--border-secondary)'
               }}>
            
            {/* Restored the functional textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message DocQ"
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-30 min-h-6 placeholder:text-sm"
              style={{ color: 'var(--text-primary)' }}
              rows={1}
              disabled={isLoading}
            />
            
            {/* Restored the button's full functionality */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 focus:scale-110 disabled:scale-100 disabled:opacity-50"
              style={{ 
                backgroundColor: input.trim() || isLoading ? 'var(--primary-green)' : 'var(--bg-highlight)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (input.trim() || isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-green-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() || isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-green)'
                }
              }}
              aria-label={isLoading ? "Stop generation" : "Send message"}
            >
              {isLoading ? (
                <Square size={16} />
              ) : (
                <Send size={16} />
              )}
            </button>
        
          </div>
        </form>
        
        <div className="flex items-center justify-center mt-2">
          <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
            DocQ can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}
"use client"

import { ChatHistory } from "./chat-history"
import type { Chat } from "@/types/chat"
import { X } from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  chats: Chat[]
  activeChat: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onCloseSidebar?: () => void
}

export function Sidebar({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onCloseSidebar,
}: SidebarProps) {
  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="p-3 pl-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
        <img
          src="/logo-bg-removed.png"
          alt="DocQ"
          width={45}
          className="select-none"
          />
          </Link>

        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-md transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <ChatHistory
        chats={chats}
        activeChat={activeChat}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
        onDeleteChat={onDeleteChat}
      />
    </div>
  )
}

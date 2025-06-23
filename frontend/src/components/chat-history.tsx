import { useState } from "react";
import { Edit3, Search, MessageSquare, Settings } from "lucide-react";
import { SearchSheet } from "./search/search-sheet";
import { ChatOptions } from "./chat-options/options-down";
import { Chat } from "../types/chat";

interface ChatHistoryProps {
  chats: Chat[];
  activeChat: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onOpenSettings: () => void;
}

export function ChatHistory({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings,
}: ChatHistoryProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);

  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const truncate = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
  };

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <>
      <div
        className="h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="p-3 space-y-1">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <Edit3 size={16} />
            <span>New chat</span>
          </button>
          <button
            onClick={() => setSearchSheetOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <Search size={16} />
            <span>Search chats</span>
          </button>
        </div>
        <div
          className="mx-3 h-px"
          style={{ backgroundColor: "var(--border-primary)" }}
        />
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Chats
            </h3>
          </div>
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <MessageSquare
                size={24}
                style={{ color: "var(--text-tertiary)" }}
                className="mb-2"
              />
              <p
                className="text-sm text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                No chats yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat: any) => (
                <div
                  key={chat.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className="w-full text-left p-3 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor:
                        activeChat === chat.id
                          ? "var(--bg-elevated)"
                          : hoveredChat === chat.id
                          ? "var(--bg-tertiary)"
                          : "transparent",
                      color:
                        activeChat === chat.id
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    <div className="font-medium text-sm mb-1">
                      {truncate(chat.title, 30)}
                    </div>
                    <div className="text-xs opacity-70">
                      {formatDate(chat.updatedAt)}
                    </div>
                  </button>
                  {hoveredChat === chat.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                      <ChatOptions onDelete={() => onDeleteChat(chat.id)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className="p-3 border-t"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>
      <SearchSheet
        chats={chats}
        isOpen={searchSheetOpen}
        onClose={() => setSearchSheetOpen(false)}
        onSelectChat={onSelectChat}
      />
    </>
  );
}
import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Chat } from "@/types/chat";

interface SearchSheetProps {
  chats: Chat[];
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}

export function SearchSheet({
  chats,
  isOpen,
  onClose,
  onSelectChat,
}: SearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((message) =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
        <div
          className="w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)",
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Search Chats
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-tertiary)")
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "var(--text-tertiary)" }}
              />
              <input
                type="text"
                placeholder="Search chats and messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border transition-colors"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-focus)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-primary)")
                }
                autoFocus
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {searchQuery
                      ? "No chats found"
                      : "Start typing to search..."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className="w-full text-left p-3 rounded-lg transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--bg-tertiary)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <div className="font-medium text-sm mb-1">
                        {chat.title}
                      </div>
                      <div className="text-xs opacity-70">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
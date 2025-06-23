"use client";

import { useEffect, useRef, useState } from "react";
import type { Chat, Message } from "@/types/chat";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { askQuestion } from "@/lib/api";
import { generateId } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import EmptyStateChat from "./empty-state-chat";

interface ChatInterfaceProps {
  chat: Chat;
  sessionId: string | null;
  onUpdateChat: (chat: Chat) => void;
}

export function ChatInterface({
  chat,
  sessionId,
  onUpdateChat,
}: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSendMessage = async (content: string) => {
    if (!sessionId) {
      alert(
        "Session not ready. Please upload documents through the settings panel first.",
      );
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      content,
      role: "user",
      timestamp: Date.now(),
    };

    let updatedChat: Chat;

    if (!chat.id) {
      updatedChat = {
        id: generateId(),
        title: content.length > 30 ? content.substring(0, 30) + "..." : content,
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      updatedChat = {
        ...chat,
        messages: [...chat.messages, userMessage],
        updatedAt: Date.now(),
      };
      if (chat.messages.length === 0) {
        updatedChat.title =
          content.length > 30 ? content.substring(0, 30) + "..." : content;
      }
    }

    onUpdateChat(updatedChat);
    setIsLoading(true);

    try {
      const response = await askQuestion(sessionId, content);

      const assistantMessage: Message = {
        id: generateId(),
        content:
          response.content ||
          "I apologize, but I couldn't generate a response at this time. Please try again.",
        role: "assistant",
        timestamp: Date.now(),
      };

      const finalChat: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: Date.now(),
      };

      onUpdateChat(finalChat);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        content:
          "I'm experiencing some technical difficulties. Please try your question again in a moment.",
        role: "assistant",
        timestamp: Date.now(),
      };

      const finalChat: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
        updatedAt: Date.now(),
      };
      onUpdateChat(finalChat);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex-1 overflow-y-auto">
        {chat.messages.length === 0 ? (
          <EmptyStateChat />
        ) : (
          <div className="p-6">
            {chat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6 fade-in">
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-full"
                    style={{ backgroundColor: "var(--bg-surface)" }}
                  >
                    <Loader2
                      size={18}
                      className="animate-spin"
                      style={{ color: "var(--spotify-green)" }}
                    />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tl-md"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Researching your question...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
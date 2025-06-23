"use client";

import { useEffect, useState } from "react";
import type { Chat } from "@/types/chat";
import { ChatInterface } from "@/components/chat-interface";
import { Sidebar } from "@/components/sidebar";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import {
  getChats,
  saveChat,
  deleteChat,
  getActiveChat,
  setActiveChat,
  getSessionId,
  setSessionId as storeSessionId,
} from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { Menu, X, HelpCircle } from "lucide-react";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const storedChats = getChats();
    setChats(storedChats);

    const storedActive = getActiveChat();
    if (storedActive && storedChats.some((c) => c.id === storedActive)) {
      setActiveChatId(storedActive);
    } else if (storedChats.length) {
      setActiveChatId(storedChats[0].id);
      setActiveChat(storedChats[0].id);
    }

    const storedSid = getSessionId();
    if (storedSid) {
      setSessionId(storedSid);
    }
  }, []);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newChat, ...chats];
    setChats(updated);
    setActiveChatId(newChat.id);
    saveChat(newChat);
    setActiveChat(newChat.id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setActiveChat(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    deleteChat(id);
    if (activeChatId === id) {
      if (updated.length) {
        setActiveChatId(updated[0].id);
        setActiveChat(updated[0].id);
      } else {
        setActiveChatId("");
        setActiveChat("");
      }
    }
  };

  const handleUpdateChat = (chat: Chat) => {
    const exists = chats.some((c) => c.id === chat.id);
    const updated = exists
      ? chats.map((c) => (c.id === chat.id ? chat : c))
      : [chat, ...chats];
    setChats(updated);
    saveChat(chat);
    if (!exists) {
      setActiveChatId(chat.id);
      setActiveChat(chat.id);
    }
  };

  const handleSessionReady = (sid: string) => {
    setSessionId(sid);
    storeSessionId(sid);
    setSettingsOpen(false);
  };

  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    ({
      id: "",
      title: "",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Chat);

  return (
    <>
      <main
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div
          className={`h-full transition-all duration-300 ease-in-out z-40 ${
            sidebarOpen ? "w-80" : "w-0"
          } ${isMobile ? "fixed" : "relative"}`}
        >
          <div
            className={`h-full w-80 ${
              !sidebarOpen && "transform -translate-x-full"
            } transition-transform duration-300 border-r`}
            style={{ borderColor: "var(--border-primary)" }}
          >
            <Sidebar
              chats={chats}
              activeChat={activeChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
              onCloseSidebar={() => setSidebarOpen(false)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full relative">
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 focus:scale-110"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                }}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            <button
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 focus:scale-110"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
              aria-label="Help"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          <div className="flex-1 h-full overflow-hidden">
            <ChatInterface
              chat={activeChat}
              sessionId={sessionId}
              onUpdateChat={handleUpdateChat}
            />
          </div>
        </div>

        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </main>
      <SettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSessionReady={handleSessionReady}
      />
    </>
  );
}
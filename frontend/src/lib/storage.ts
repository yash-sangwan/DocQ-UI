import type { Chat } from "@/types/chat"

const CHATS_KEY = process.env.NEXT_PUBLIC_CHATS_KEY || 'research-agent-chats'
const ACTIVE_CHAT_KEY = process.env.NEXT_PUBLIC_ACTIVE_CHAT_KEY || 'research-agent-active-chat'

export function getChats(): Chat[] {
  if (typeof window === "undefined") return []

  try {
    const chats = localStorage.getItem(CHATS_KEY)
    return chats ? JSON.parse(chats) : []
  } catch (error) {
    console.error("Error loading chats:", error)
    return []
  }
}

export function saveChat(chat: Chat): void {
  if (typeof window === "undefined") return

  try {
    const chats = getChats()
    const existingIndex = chats.findIndex((c) => c.id === chat.id)

    if (existingIndex >= 0) {
      chats[existingIndex] = chat
    } else {
      chats.unshift(chat) // Add new chats to the beginning
    }

    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
  } catch (error) {
    console.error("Error saving chat:", error)
  }
}

export function deleteChat(chatId: string): void {
  if (typeof window === "undefined") return

  try {
    const chats = getChats().filter((chat) => chat.id !== chatId)
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))

    // If active chat is deleted, clear active chat
    const activeChat = getActiveChat()
    if (activeChat === chatId) {
      setActiveChat("")
    }
  } catch (error) {
    console.error("Error deleting chat:", error)
  }
}

export function getActiveChat(): string {
  if (typeof window === "undefined") return ""

  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY) || ""
  } catch (error) {
    console.error("Error loading active chat:", error)
    return ""
  }
}

export function setActiveChat(chatId: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(ACTIVE_CHAT_KEY, chatId)
  } catch (error) {
    console.error("Error setting active chat:", error)
  }
}
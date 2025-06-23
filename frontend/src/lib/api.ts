import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

export async function askQuestion(query: string) {
  try {
    console.log("Sending query:", query)
    const response = await api.post("/ask", { query })

    return response
  } catch (error) {
    console.error("Error asking question:", error)
     
    throw error
  }
}
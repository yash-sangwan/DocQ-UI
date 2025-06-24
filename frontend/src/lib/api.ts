import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
});

export async function uploadPdfs(
  files: File[],
  customPrompt?: string
): Promise<{ session_id: string; message: string }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  
  if (customPrompt) {
    formData.append("custom_prompt", customPrompt);
  }

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function askQuestion(
  sessionId: string,
  question: string,
  customPrompt?: string
): Promise<{ content: string }> {
  const { data } = await api.post<{ content: string }>(`/ask/${sessionId}`, {
    question,
    custom_prompt: customPrompt,
  });
  return data;
}

export async function updateSessionPrompt(
  sessionId: string,
  customPrompt: string
): Promise<{ message: string }> {
  const { data } = await api.post(`/sessions/${sessionId}/prompt`, {
    custom_prompt: customPrompt,
  });
  return data;
}

export async function getSessionInfo(
  sessionId: string
): Promise<{
  session_id: string;
  created_at: number;
  file_count: number;
  file_names: string[];
}> {
  const { data } = await api.get(`/sessions/${sessionId}`);
  return data;
}

export async function deleteSession(
  sessionId: string
): Promise<{ message: string }> {
  const { data } = await api.delete(`/sessions/${sessionId}`);
  return data;
}

export async function healthCheck(): Promise<{
  status: string;
  active_sessions: number;
  models_loaded: boolean;
}> {
  const { data } = await api.get("/health");
  return data;
}
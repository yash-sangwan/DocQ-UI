import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
});

export async function uploadPdfs(
  files: File[],
): Promise<{ session_id: string }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function askQuestion(
  sid: string,
  question: string,
): Promise<{ content: string }> {
  const { data } = await api.post<{ content: string }>(`/ask/${sid}`, {
    question,
  });
  return data;
}
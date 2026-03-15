const AI_API_BASE = import.meta.env.VITE_AI_API_URL ?? "http://localhost:8000";

export interface MedBotMessage {
  role:    "user" | "assistant";
  content: string;
}

export interface MedBotResponse {
  text:      string;
  audioBlob: Blob;
}

export async function sendMedBotMessage(
  prompt:   string,
  history:  MedBotMessage[],
  profile:  object | null,
  authToken?: string,
): Promise<MedBotResponse> {
  const res = await fetch(`${AI_API_BASE}/medbot/chat`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ prompt, history, profile }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Medbot request failed");
  }

  const audioBlob = await res.blob();
  const text      = res.headers.get("X-Juno-Text") ?? "";

  return { text, audioBlob };
}
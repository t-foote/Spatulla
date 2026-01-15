import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
}

function getModel(): string {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

export interface ImagePart {
  mimeType: string;
  data: string; // base64
}

export async function generateVideoPrompt(
  images: ImagePart[],
  userText?: string
): Promise<string> {
  const ai = getClient();
  const model = getModel();

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    ...images.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.data },
    })),
    { text: buildUserMessage(userText) },
  ];

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new Error("INVALID_RESPONSE");
  }

  return text.trim();
}

export function getModelName(): string {
  return getModel();
}

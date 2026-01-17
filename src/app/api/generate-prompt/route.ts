import { NextRequest, NextResponse } from "next/server";
import { generateVideoPrompt } from "@/lib/gemini";
import { validateServerFiles, MAX_TEXT_LENGTH } from "@/lib/validation";
import type { GeneratePromptResponse, GeneratePromptError } from "@/types/api";

export const maxDuration = 60;

function err(message: string, status: number, code?: GeneratePromptError["code"]): NextResponse {
  return NextResponse.json({ error: message, code } satisfies GeneratePromptError, { status });
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return err("Could not parse request body.", 400, "INVALID_RESPONSE");
  }

  const imageFiles = formData.getAll("images") as File[];
  const userText = (formData.get("userText") as string | null) ?? "";

  const hasImages = imageFiles.length > 0 && imageFiles[0]?.size > 0;
  const hasText = userText.trim().length > 0;

  if (!hasImages && !hasText) {
    return err("Please upload at least one image or enter some text.", 400, "EMPTY_REQUEST");
  }

  if (userText.length > MAX_TEXT_LENGTH) {
    return err(`Text prompt must be ${MAX_TEXT_LENGTH} characters or fewer.`, 400, "INVALID_RESPONSE");
  }

  const validImages = hasImages ? imageFiles : [];

  if (validImages.length > 0) {
    const fileError = validateServerFiles(validImages);
    if (fileError) {
      return err(fileError, 400, "INVALID_FILE");
    }
  }

  const imageParts = await Promise.all(
    validImages.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return { mimeType: file.type, data: base64 };
    })
  );

  let promptText: string;
  try {
    promptText = await generateVideoPrompt(imageParts, userText || undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "INVALID_RESPONSE") {
      return err("Empty response received. Please try again.", 502, "INVALID_RESPONSE");
    }

    if (
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate")
    ) {
      return err(
        "Service quota reached. Please try again later.",
        429,
        "QUOTA_EXCEEDED"
      );
    }

    console.error(error);
    return err(message || "An unexpected error occurred. Please try again.", 500, "INTERNAL_ERROR");
  }

  const response: GeneratePromptResponse = {
    prompt: promptText,
    meta: {
      imageCount: validImages.length,
    },
  };

  return NextResponse.json(response);
}

export interface GeneratePromptResponse {
  prompt: string;
  meta: {
    imageCount: number;
  };
}

export interface GeneratePromptError {
  error: string;
  code?: "EMPTY_REQUEST" | "INVALID_FILE" | "TOO_MANY_FILES" | "FILE_TOO_LARGE" | "QUOTA_EXCEEDED" | "INVALID_RESPONSE" | "INTERNAL_ERROR";
}

"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Film, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/image-dropzone";
import { PromptResult } from "@/components/prompt-result";
import { MAX_TEXT_LENGTH } from "@/lib/validation";
import type { GeneratePromptResponse } from "@/types/api";

interface FormValues {
  userText: string;
}

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<GeneratePromptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { userText: "" } });

  const userText = watch("userText");
  const charCount = userText.length;

  const hasContent = files.length > 0 || userText.trim().length > 0;

  const submitRequest = useCallback(
    async (userText: string) => {
      setIsLoading(true);
      setSubmitError(null);

      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      if (userText.trim()) {
        formData.append("userText", userText.trim());
      }

      try {
        const res = await fetch("/api/generate-prompt", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
          const msg =
            json?.error ||
            (res.status === 429
              ? "Service quota reached. Please try again later."
              : "Something went wrong. Please try again.");
          setSubmitError(msg);
          return;
        }

        setResult(json as GeneratePromptResponse);
      } catch {
        setSubmitError("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [files]
  );

  const onSubmit = handleSubmit(({ userText }) => submitRequest(userText));

  const handleRegenerate = useCallback(() => {
    if (!hasContent) {
      toast.error("Add an image or text before regenerating.");
      return;
    }
    submitRequest(userText);
  }, [hasContent, submitRequest, userText]);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <Label>Reference images</Label>
          <ImageDropzone files={files} onChange={setFiles} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="userText">Additional context</Label>
            <span
              className={`text-xs ${charCount > MAX_TEXT_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
            >
              {charCount}/{MAX_TEXT_LENGTH}
            </span>
          </div>
          <Textarea
            id="userText"
            placeholder="Add context to the prompt here"
            rows={4}
            disabled={isLoading}
            aria-invalid={!!errors.userText}
            {...register("userText", {
              maxLength: {
                value: MAX_TEXT_LENGTH,
                message: `Keep it under ${MAX_TEXT_LENGTH} characters.`,
              },
            })}
          />
          {errors.userText && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.userText.message}
            </p>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {!hasContent && (
          <p className="text-xs text-muted-foreground text-center">
            Upload at least one image or enter some text to get started.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !hasContent || charCount > MAX_TEXT_LENGTH}
          className="w-full gap-2 text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating prompt…
            </>
          ) : (
            <>
              <Film className="h-5 w-5" />
              Generate Prompt
            </>
          )}
        </Button>
      </form>

      {result && (
        <PromptResult
          result={result}
          onRegenerate={handleRegenerate}
          isRegenerating={isLoading}
        />
      )}
    </div>
  );
}

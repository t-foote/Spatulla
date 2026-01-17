"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { GeneratePromptResponse } from "@/types/api";

interface PromptResultProps {
  result: GeneratePromptResponse;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function PromptResult({ result, onRegenerate, isRegenerating }: PromptResultProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy — please select the text manually.");
    }
  }

  return (
    <div className="animate-fade-in space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Generated Prompt</h2>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cpu className="h-3 w-3" />
          {result.meta.imageCount > 0 && (
            <>
              <span className="text-border">·</span>
              <span>{result.meta.imageCount} image{result.meta.imageCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          className="min-h-[120px] rounded-lg border border-border bg-background p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap"
          role="region"
          aria-label="Generated video prompt"
        >
          {result.prompt}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          variant="default"
          size="sm"
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy prompt
            </>
          )}
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          size="sm"
          disabled={isRegenerating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  validateImageFile,
  MAX_FILES,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/lib/validation";
import { formatFileSize, resizeImageFile } from "@/lib/image-processing";

interface ImageDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageDropzone({ files, onChange, disabled }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const processFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const newFiles = Array.from(incoming);
      const errs: string[] = [];
      const valid: File[] = [];

      const remaining = MAX_FILES - files.length;
      if (remaining <= 0) {
        setErrors([`You can upload at most ${MAX_FILES} images.`]);
        return;
      }

      for (const file of newFiles.slice(0, remaining)) {
        const err = validateImageFile(file);
        if (err) {
          errs.push(err);
        } else {
          try {
            const resized = await resizeImageFile(file);
            valid.push(resized);
          } catch {
            valid.push(file); // fall back to original
          }
        }
      }

      setErrors(errs);
      if (valid.length > 0) {
        onChange([...files, ...valid]);
      }
    },
    [files, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(files.filter((_, i) => i !== index));
      setErrors([]);
    },
    [files, onChange]
  );

  const isFull = files.length >= MAX_FILES;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled || isFull ? -1 : 0}
        aria-label="Upload images — drag and drop or click to browse"
        onClick={() => !disabled && !isFull && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !isFull) {
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isDragging && !disabled
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5",
          (disabled || isFull) && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent",
          !disabled && !isFull && "cursor-pointer"
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          )}
        >
          <Upload className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isFull ? "Maximum images reached" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {MAX_FILES} images · JPEG, PNG, WebP · Max {MAX_FILE_SIZE_MB} MB each
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled || isFull}
          aria-hidden="true"
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1" role="alert">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Uploaded images</span>
            <Badge variant="outline">
              {files.length}/{MAX_FILES}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {files.map((file, index) => (
              <div key={index} className="group relative aspect-square">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview of ${file.name}`}
                  className="h-full w-full rounded-lg object-cover border border-border"
                />
                <div className="absolute inset-0 flex flex-col items-end justify-between rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <span className="text-[10px] text-white/80 leading-tight text-right">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <div className="absolute bottom-1 left-1 group-hover:opacity-0 transition-opacity">
                  <ImageIcon className="h-3 w-3 text-white/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

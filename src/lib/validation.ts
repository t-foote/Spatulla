export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedMimeType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export const MAX_FILE_SIZE_MB = 8;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILES = 5;
export const MAX_TEXT_LENGTH = 2000;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as AcceptedMimeType)) {
    return `"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`;
  }
  return null;
}

export function validateServerFiles(files: File[]): string | null {
  if (files.length > MAX_FILES) {
    return `Too many files. Maximum is ${MAX_FILES}.`;
  }
  for (const file of files) {
    const err = validateImageFile(file);
    if (err) return err;
  }
  return null;
}

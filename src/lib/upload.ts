import type { DocumentCategory } from "@/lib/types";
import { sanitizeFilename } from "@/lib/utils";

const acceptedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg"
]);

const acceptedExtensions = new Set([
  "pdf",
  "xlsx",
  "xls",
  "csv",
  "docx",
  "pptx",
  "png",
  "jpg",
  "jpeg"
]);

export function validateUpload(file: File, maxSizeMb: number) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!acceptedExtensions.has(extension) || !acceptedMimeTypes.has(file.type)) {
    return {
      valid: false,
      error:
        "Dieses Dateiformat ist nicht zugelassen. Verwenden Sie PDF, Office-Dokumente, CSV, PNG oder JPG."
    } as const;
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return {
      valid: false,
      error: `Die Datei überschreitet die maximale Größe von ${maxSizeMb} MB.`
    } as const;
  }
  return { valid: true, error: null } as const;
}

export function buildStoragePath(input: {
  organisationId: string;
  engagementId: string;
  category: DocumentCategory;
  documentId: string;
  filename: string;
}) {
  return [
    input.organisationId,
    input.engagementId,
    input.category,
    input.documentId,
    sanitizeFilename(input.filename)
  ].join("/");
}

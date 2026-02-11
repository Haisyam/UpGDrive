import { getFileExtension } from "@/lib/formatters";

export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = {
  doc: "Word",
  docx: "Word",
  xls: "Excel",
  xlsx: "Excel",
  pdf: "PDF",
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
  webp: "Image",
  gif: "Image",
};

export const ALLOWED_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export const ACCEPT_ATTRIBUTE = Object.keys(ALLOWED_EXTENSIONS)
  .map((ext) => `.${ext}`)
  .join(",");

export function getFileCategory(fileName = "") {
  const extension = getFileExtension(fileName);
  return ALLOWED_EXTENSIONS[extension] ?? "Unknown";
}

export function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push("File belum dipilih.");
    return { valid: false, errors };
  }

  const extension = getFileExtension(file.name);
  const hasValidExtension = Boolean(ALLOWED_EXTENSIONS[extension]);
  const hasValidMimeType = ALLOWED_MIME_TYPES.has(file.type);

  if (!hasValidExtension || !hasValidMimeType) {
    errors.push(
      "Format file tidak didukung. Gunakan Word (.doc/.docx), Excel (.xls/.xlsx), PDF, atau gambar (.png/.jpg/.jpeg/.webp/.gif).",
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push("Ukuran file melebihi batas 30MB.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

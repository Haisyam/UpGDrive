const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]+/g;

export function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** exponent;

  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function getFileExtension(fileName = "") {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return "";
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

export function stripFileExtension(fileName = "") {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return fileName;
  }

  return fileName.slice(0, lastDotIndex);
}

export function sanitizeFileBaseName(name = "") {
  const trimmed = name.trim().replace(INVALID_FILENAME_CHARS, "-").replace(/\s+/g, " ");
  return trimmed;
}

export function buildRenamedFilename(newBaseName, originalFileName) {
  const sanitizedBaseName = sanitizeFileBaseName(newBaseName);
  const extension = getFileExtension(originalFileName);

  if (!sanitizedBaseName) {
    return "";
  }

  return extension ? `${sanitizedBaseName}.${extension}` : sanitizedBaseName;
}

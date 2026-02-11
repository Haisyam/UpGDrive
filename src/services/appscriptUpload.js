import {
  APP_SCRIPT_API_KEY,
  APP_SCRIPT_PAYLOAD_MODE,
  APP_SCRIPT_TIMEOUT_MS,
  APP_SCRIPT_WEBAPP_URL,
} from "@/config/appscript";
import { buildRenamedFilename } from "@/lib/formatters";

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsArrayBuffer(file);
  });
}

async function toByteArray(file) {
  const buffer = await readFileAsArrayBuffer(file);
  return [...new Int8Array(buffer)];
}

async function toBase64(file) {
  const buffer = await readFileAsArrayBuffer(file);
  const bytes = new Uint8Array(buffer);
  let binary = "";

  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function buildRequestUrl({ fileName, mimeType, mode }) {
  const query = new URLSearchParams({
    filename: fileName,
    mimeType,
    mode,
  });

  // For base64 mode, API key is sent in JSON body to avoid exposing it in URL.
  if (APP_SCRIPT_API_KEY && mode === "byteArray") {
    query.set("apiKey", APP_SCRIPT_API_KEY);
  }

  return `${APP_SCRIPT_WEBAPP_URL}?${query.toString()}`;
}

function parseResponsePayload(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function createTimeoutSignal(externalSignal) {
  if (externalSignal && typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.any([externalSignal, AbortSignal.timeout(APP_SCRIPT_TIMEOUT_MS)]);
  }

  if (externalSignal) {
    return externalSignal;
  }

  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(APP_SCRIPT_TIMEOUT_MS);
  }

  return externalSignal;
}

export async function uploadToAppScript({ file, newName, signal, payloadMode = APP_SCRIPT_PAYLOAD_MODE }) {
  if (!APP_SCRIPT_WEBAPP_URL) {
    throw new Error("APP Script URL belum dikonfigurasi. Set VITE_APP_SCRIPT_WEBAPP_URL terlebih dahulu.");
  }

  const renamedFilename = buildRenamedFilename(newName, file.name);
  if (!renamedFilename) {
    throw new Error("Nama file baru tidak valid.");
  }

  const mode = payloadMode === "byteArray" ? "byteArray" : "base64";

  const bodyData =
    mode === "base64"
      ? {
          filename: renamedFilename,
          mimeType: file.type,
          encoding: "base64",
          data: await toBase64(file),
          apiKey: APP_SCRIPT_API_KEY || undefined,
        }
      : await toByteArray(file);

  const response = await fetch(
    buildRequestUrl({ fileName: renamedFilename, mimeType: file.type, mode }),
    {
      method: "POST",
      // Keep this as a "simple request" to avoid CORS preflight failure on Apps Script /exec.
      // Sending string body without custom headers defaults to text/plain;charset=UTF-8.
      body: JSON.stringify(bodyData),
      signal: createTimeoutSignal(signal),
    },
  );

  const rawText = await response.text();
  const payload = parseResponsePayload(rawText);

  if (!response.ok) {
    throw new Error(payload.error || payload.message || "Upload gagal diproses oleh Apps Script.");
  }

  if (payload?.error) {
    throw new Error(payload.error);
  }

  return {
    success: true,
    fileName: payload.filename || renamedFilename,
    fileId: payload.fileId || payload.id || "",
    fileUrl: payload.fileUrl || payload.url || "",
    raw: payload,
  };
}

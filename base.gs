var MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;
var FILE_RULES = {
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg", "image/pjpeg"],
  jpeg: ["image/jpeg", "image/pjpeg"],
  webp: ["image/webp"],
  gif: ["image/gif"]
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Request body tidak ditemukan.");
    }

    var request = parseUploadRequest_(e);
    validateUploadRequest_(request);

    // Optional API key check. Set Script Property "UPLOAD_API_KEY" jika ingin mengaktifkan.
    validateApiKey_(e, request);

    var folderId = "id gdrive"; // ambil dari link gdrive
    var blob = Utilities.newBlob(request.bytes, request.mimeType, request.filename);
    var file = DriveApp.getFolderById(folderId).createFile(blob);

    return jsonResponse_({
      success: true,
      filename: file.getName(),
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      mimeType: request.mimeType,
      size: request.bytes.length
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      error: error && error.message ? error.message : "Upload gagal diproses."
    });
  }
}

function parseUploadRequest_(e) {
  var query = e.parameter || {};
  var payload;

  try {
    payload = JSON.parse(e.postData.contents);
  } catch (_parseErr) {
    throw new Error("Body request bukan JSON valid.");
  }

  var mode = (query.mode || "").toLowerCase();
  var isBase64Mode = mode === "base64";
  var bytes;
  var filename;
  var mimeType;
  var apiKey;

  if (isBase64Payload_(payload) || isBase64Mode) {
    if (!payload || typeof payload.data !== "string" || !payload.data.trim()) {
      throw new Error("Payload base64 tidak valid.");
    }

    bytes = Utilities.base64Decode(payload.data);
    filename = payload.filename || query.filename || "";
    mimeType = payload.mimeType || query.mimeType || "";
    apiKey = payload.apiKey || query.apiKey || "";
  } else if (Array.isArray(payload)) {
    bytes = normalizeBytes_(payload);
    filename = query.filename || "";
    mimeType = query.mimeType || "";
    apiKey = query.apiKey || "";
  } else {
    throw new Error("Mode upload tidak dikenali. Gunakan base64 atau byteArray.");
  }

  return {
    bytes: bytes,
    filename: sanitizeFilename_(filename),
    mimeType: String(mimeType || "").toLowerCase().trim(),
    apiKey: String(apiKey || "")
  };
}

function isBase64Payload_(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    String(payload.encoding || "").toLowerCase() === "base64" &&
    typeof payload.data === "string"
  );
}

function normalizeBytes_(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("Byte array tidak valid.");
  }

  var normalized = [];
  for (var i = 0; i < arr.length; i++) {
    var value = Number(arr[i]);

    if (isNaN(value)) {
      throw new Error("Byte array mengandung nilai non-numerik.");
    }

    // Int8Array client bisa berisi -128..127, ubah ke rentang byte 0..255.
    if (value < 0) {
      value = value + 256;
    }

    if (value < 0 || value > 255) {
      throw new Error("Byte array mengandung nilai di luar rentang byte.");
    }

    normalized.push(value);
  }

  return normalized;
}

function validateUploadRequest_(request) {
  if (!request.filename) {
    throw new Error("Nama file wajib diisi.");
  }

  if (!request.mimeType) {
    throw new Error("MIME type wajib diisi.");
  }

  if (!request.bytes || request.bytes.length === 0) {
    throw new Error("Konten file kosong.");
  }

  if (request.bytes.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file melebihi 30MB.");
  }

  var extension = getExtension_(request.filename);
  if (!extension || !FILE_RULES[extension]) {
    throw new Error("Ekstensi file tidak diizinkan.");
  }

  var allowedMimes = FILE_RULES[extension];
  if (allowedMimes.indexOf(request.mimeType) === -1) {
    throw new Error("MIME type tidak sesuai dengan ekstensi file.");
  }
}

function validateApiKey_(e, request) {
  var expectedKey = PropertiesService.getScriptProperties().getProperty("UPLOAD_API_KEY");
  if (!expectedKey) {
    return;
  }

  var providedKey = (request && request.apiKey) || (e && e.parameter ? e.parameter.apiKey : "");
  if (!providedKey || providedKey !== expectedKey) {
    throw new Error("API key tidak valid.");
  }
}

function sanitizeFilename_(filename) {
  var safe = String(filename || "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  return safe;
}

function getExtension_(filename) {
  var index = filename.lastIndexOf(".");
  if (index <= 0 || index === filename.length - 1) {
    return "";
  }

  return filename.substring(index + 1).toLowerCase();
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

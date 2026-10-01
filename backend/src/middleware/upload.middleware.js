import multer from "multer";

const DEFAULT_MAX_FILE_SIZE_MB = 10;

const configuredMaxFileSizeMb =
  Number.parseInt(
    process.env.MAX_FILE_SIZE_MB ||
      String(DEFAULT_MAX_FILE_SIZE_MB),
    10
  );

const maxFileSizeMb =
  Number.isInteger(configuredMaxFileSizeMb) &&
  configuredMaxFileSizeMb > 0
    ? configuredMaxFileSizeMb
    : DEFAULT_MAX_FILE_SIZE_MB;

const maxFileSizeBytes =
  maxFileSizeMb * 1024 * 1024;

const allowedMimeTypes = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",

  // Documents
  "application/pdf",
  "text/plain",
  "text/csv",

  // Microsoft Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Microsoft Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Archives
  "application/zip",
  "application/x-zip-compressed",
]);

function fileFilter(
  req,
  file,
  callback
) {
  if (
    allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    return callback(
      null,
      true
    );
  }

  const error =
    new Error(
      `Unsupported file type: ${file.mimetype}`
    );

  error.status = 400;

  return callback(
    error,
    false
  );
}

export const upload = multer({
  storage:
    multer.memoryStorage(),

  limits: {
    fileSize:
      maxFileSizeBytes,

    files:
      1,
  },

  fileFilter,
});
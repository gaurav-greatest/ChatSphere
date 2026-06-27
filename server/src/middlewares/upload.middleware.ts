import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_AUDIO_TYPES,
];

const MAX_FILE_SIZE = {
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  document: 25 * 1024 * 1024, // 25MB
  audio: 10 * 1024 * 1024, // 10MB
  avatar: 5 * 1024 * 1024, // 5MB
};

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`${ERROR_MESSAGES.INVALID_FILE_TYPE}: ${path.extname(file.originalname)}`));
  }
};

/** General file upload (images, videos, documents, audio) */
export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE.video }, // Use largest limit; validate per-type in service
});

/** Avatar upload (images only, 5MB limit) */
export const uploadAvatar = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest('Avatar must be an image (JPEG, PNG, GIF, or WebP)'));
    }
  },
  limits: { fileSize: MAX_FILE_SIZE.avatar },
});

export { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_DOCUMENT_TYPES, ALLOWED_AUDIO_TYPES };

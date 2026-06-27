export const APP_NAME = 'ChatSphere';
export const API_VERSION = 'v1';

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const MAX_FILE_SIZES = {
  avatar: 5 * 1024 * 1024, // 5MB
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  document: 25 * 1024 * 1024, // 25MB
  audio: 10 * 1024 * 1024, // 10MB
} as const;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const ACCEPTED_DOC_TYPES = ['application/pdf', 'application/msword', 'text/plain'];
export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

export const MESSAGES_PER_PAGE = 50;
export const CHATS_PER_PAGE = 20;
export const SEARCH_DEBOUNCE_MS = 300;
export const TYPING_DEBOUNCE_MS = 1000;

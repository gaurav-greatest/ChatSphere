export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'A user with this email already exists',
  USERNAME_TAKEN: 'This username is already taken',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_REQUIRED: 'Authentication token is required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified',
  PASSWORD_RESET_EXPIRED: 'Password reset link has expired',

  // Chat
  CHAT_NOT_FOUND: 'Chat not found',
  CHAT_ALREADY_EXISTS: 'Direct chat already exists with this user',
  NOT_CHAT_MEMBER: 'You are not a member of this chat',
  CANNOT_CHAT_SELF: 'You cannot create a chat with yourself',
  USER_BLOCKED: 'This user has been blocked',

  // Group
  GROUP_NOT_FOUND: 'Group not found',
  NOT_GROUP_ADMIN: 'You must be a group admin to perform this action',
  ALREADY_GROUP_MEMBER: 'User is already a member of this group',
  NOT_GROUP_MEMBER: 'User is not a member of this group',
  MIN_GROUP_MEMBERS: 'A group must have at least 2 members',
  MAX_GROUP_MEMBERS: 'A group can have at most 256 members',
  CANNOT_REMOVE_CREATOR: 'Cannot remove the group creator',

  // Message
  MESSAGE_NOT_FOUND: 'Message not found',
  NOT_MESSAGE_SENDER: 'You can only edit/delete your own messages',
  MESSAGE_TOO_OLD: 'Message is too old to edit',
  EMPTY_MESSAGE: 'Message content cannot be empty',

  // File / Media
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size',
  INVALID_FILE_TYPE: 'This file type is not supported',
  UPLOAD_FAILED: 'Failed to upload file',

  // General
  FORBIDDEN: 'You do not have permission to perform this action',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  INTERNAL_ERROR: 'An unexpected error occurred',
  VALIDATION_ERROR: 'Validation failed',
  NOT_FOUND: 'The requested resource was not found',
} as const;

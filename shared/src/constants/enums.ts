export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  VOICE = 'voice',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum NotificationType {
  MESSAGE = 'message',
  GROUP_INVITE = 'group_invite',
  GROUP_UPDATE = 'group_update',
  MENTION = 'mention',
  REACTION = 'reaction',
  SYSTEM = 'system',
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy',
}

export enum PrivacyOption {
  EVERYONE = 'everyone',
  CONTACTS = 'contacts',
  NOBODY = 'nobody',
}

export enum GroupRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

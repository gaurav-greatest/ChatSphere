/**
 * Socket.IO event names used across client and server.
 * Centralized here to prevent typos and ensure consistency.
 */
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',

  // Chat rooms
  JOIN_CHAT: 'chat:join',
  LEAVE_CHAT: 'chat:leave',
  CHAT_UPDATED: 'chat:updated',
  CHAT_DELETED: 'chat:deleted',

  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_EDIT: 'message:edit',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_DELIVERY_RECEIPT: 'message:delivery-receipt',
  MESSAGE_READ: 'message:read',
  MESSAGE_READ_RECEIPT: 'message:read-receipt',

  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  USER_TYPING: 'user:typing',
  USER_STOP_TYPING: 'user:stop-typing',

  // Reactions
  REACTION_ADD: 'reaction:add',
  REACTION_ADDED: 'reaction:added',
  REACTION_REMOVE: 'reaction:remove',
  REACTION_REMOVED: 'reaction:removed',

  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PRESENCE_UPDATE: 'presence:update',

  // Group
  GROUP_MEMBER_ADDED: 'group:member-added',
  GROUP_MEMBER_REMOVED: 'group:member-removed',
  GROUP_UPDATED: 'group:updated',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',

  // System
  HEARTBEAT: 'heartbeat',
  ERROR: 'error',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

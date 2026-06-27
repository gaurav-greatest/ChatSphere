import type { IUserProfile } from './user.types.js';
import type { IMessage } from './message.types.js';
import type { ChatType } from '../constants/enums.js';

export interface IChat {
  _id: string;
  type: ChatType;
  members: string[];
  admins: string[];
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  lastMessage?: IMessage;
  pinnedMessages: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatPopulated {
  _id: string;
  type: ChatType;
  members: IUserProfile[];
  admins: string[];
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  lastMessage?: IMessage;
  pinnedMessages: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  unreadCount?: number;
  isMuted?: boolean;
  isArchived?: boolean;
}

export interface ICreateDirectChatPayload {
  recipientId: string;
}

export interface ICreateGroupPayload {
  groupName: string;
  members: string[];
  groupDescription?: string;
  groupAvatar?: string;
}

export interface IUpdateGroupPayload {
  groupName?: string;
  groupDescription?: string;
  groupAvatar?: string;
}

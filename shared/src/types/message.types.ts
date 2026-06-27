import type { MessageType } from '../constants/enums.js';

export interface IAttachment {
  url: string;
  publicId: string;
  type: string;
  size: number;
  name: string;
  mimeType: string;
  thumbnailUrl?: string;
}

export interface IReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface IReadReceipt {
  userId: string;
  readAt: Date;
}

export interface IMessage {
  _id: string;
  chatId: string;
  sender: string;
  content: string;
  type: MessageType;
  attachments: IAttachment[];
  replyTo?: string;
  forwardedFrom?: string;
  reactions: IReaction[];
  readBy: IReadReceipt[];
  deliveredTo: string[];
  editedAt?: Date;
  deletedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessagePopulated extends Omit<IMessage, 'sender'> {
  sender: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  replyToMessage?: IMessage;
}

export interface ISendMessagePayload {
  chatId: string;
  content: string;
  type: MessageType;
  attachments?: IAttachment[];
  replyTo?: string;
}

export interface IEditMessagePayload {
  messageId: string;
  content: string;
}

export interface IForwardMessagePayload {
  messageIds: string[];
  targetChatIds: string[];
}

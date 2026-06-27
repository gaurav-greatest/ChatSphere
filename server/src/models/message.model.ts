import mongoose, { Schema, Document } from 'mongoose';
import { MessageType } from '@chatsphere/shared';

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  attachments: {
    url: string;
    publicId: string;
    type: string;
    size: number;
    name: string;
    mimeType: string;
    thumbnailUrl?: string;
  }[];
  replyTo?: mongoose.Types.ObjectId;
  forwardedFrom?: mongoose.Types.ObjectId;
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  deliveredTo: mongoose.Types.ObjectId[];
  editedAt?: Date;
  deletedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
      required: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
        name: { type: String, required: true },
        mimeType: { type: String, required: true },
        thumbnailUrl: String,
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    forwardedFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deliveredTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    editedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ────────────────────────────────────────────────
// Composite index for fast fetching in message history queries
messageSchema.index({ chatId: 1, createdAt: 1 });

const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
export default Message;

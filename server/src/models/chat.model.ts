import mongoose, { Schema, Document } from 'mongoose';
import { ChatType } from '@chatsphere/shared';

export interface IChatDocument extends Document {
  _id: mongoose.Types.ObjectId;
  type: ChatType;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  lastMessage?: mongoose.Types.ObjectId;
  pinnedMessages: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  archivedBy: mongoose.Types.ObjectId[];
  mutedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChatDocument>(
  {
    type: {
      type: String,
      enum: Object.values(ChatType),
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    groupName: {
      type: String,
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    groupAvatar: {
      type: String,
      default: undefined,
    },
    groupDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Group description cannot exceed 300 characters'],
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    pinnedMessages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    archivedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    mutedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ────────────────────────────────────────────────
chatSchema.index({ members: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ type: 1 });

const Chat = mongoose.model<IChatDocument>('Chat', chatSchema);
export default Chat;

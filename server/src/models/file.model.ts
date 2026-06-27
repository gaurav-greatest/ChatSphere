import mongoose, { Schema, Document } from 'mongoose';

export interface IFileDocument extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'avatar';
  size: number;
  mimeType: string;
  chatId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFileDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'audio', 'avatar'],
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ────────────────────────────────────────────────
fileSchema.index({ ownerId: 1, createdAt: -1 });

const FileModel = mongoose.model<IFileDocument>('File', fileSchema);
export default FileModel;

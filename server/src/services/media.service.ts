import { v2 as cloudinary } from 'cloudinary';
import FileModel from '../models/file.model.js';
import type { IFileDocument } from '../models/file.model.js';
import { ApiError } from '../utils/api-error.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const uploadMediaFile = async (
  ownerId: string,
  file: Express.Multer.File,
  type: 'image' | 'video' | 'document' | 'audio' | 'avatar',
  chatId?: string,
): Promise<IFileDocument> => {
  if (!file) {
    throw ApiError.badRequest('No file provided');
  }

  try {
    // Determine folder structure based on file type
    const folder = `chatsphere/${type}s`;
    
    // Upload to Cloudinary using standard buffer upload stream
    const uploadStream = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: type === 'document' ? 'raw' : 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });
    };

    const uploadResult = await uploadStream();

    // Create file record in database
    const fileRecord = await FileModel.create({
      ownerId: new mongoose.Types.ObjectId(ownerId),
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type,
      size: file.size,
      mimeType: file.mimetype,
      chatId: chatId ? new mongoose.Types.ObjectId(chatId) : undefined,
    });

    return fileRecord;
  } catch (err) {
    logger.error('Error uploading file to Cloudinary:', err);
    throw ApiError.internal('File upload failed');
  }
};

export const deleteMediaFile = async (fileId: string, ownerId: string): Promise<void> => {
  const file = await FileModel.findById(fileId);
  if (!file) {
    throw ApiError.notFound('File not found');
  }

  if (file.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You are not authorized to delete this file');
  }

  try {
    // Delete from Cloudinary
    // Documents are uploaded as 'raw', others as 'image'/'video'
    const resourceType = file.type === 'document' ? 'raw' : file.type === 'video' ? 'video' : 'image';
    await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType });

    // Delete from MongoDB
    await file.deleteOne();
  } catch (err) {
    logger.error(`Error deleting file ${fileId} from Cloudinary:`, err);
    throw ApiError.internal('Failed to delete file');
  }
};

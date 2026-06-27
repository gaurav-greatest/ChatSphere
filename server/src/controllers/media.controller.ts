import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import * as mediaService from '../services/media.service.js';
import { ApiError } from '../utils/api-error.js';

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('File is required');
  }

  const type = (req.body.type || 'image') as 'image' | 'video' | 'document' | 'audio' | 'avatar';
  const chatId = req.body.chatId as string | undefined;

  const fileRecord = await mediaService.uploadMediaFile(
    req.userId!,
    req.file,
    type,
    chatId,
  );

  ApiResponse.created(res, fileRecord, 'File uploaded successfully');
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.deleteMediaFile(req.params.id as string, req.userId!);
  ApiResponse.success(res, null, 'File deleted successfully');
});

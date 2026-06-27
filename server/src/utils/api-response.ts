import type { Response } from 'express';
import type { IPaginationMeta } from '@chatsphere/shared';

/**
 * Consistent JSON response helper.
 * Ensures every API response follows the same structure.
 */
export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: IPaginationMeta,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    message = 'Something went wrong',
    statusCode = 500,
    error?: string,
    errors?: Record<string, string>[],
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(error && { error }),
      ...(errors && { errors }),
    });
  }
}

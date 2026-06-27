import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/api-error.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates validation middleware from a Zod schema.
 * Validates the specified part(s) of the request and provides clear error messages.
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      next(ApiError.badRequest('Validation failed', errors));
      return;
    }

    // Replace req data with parsed/transformed data
    req[target] = result.data;
    next();
  };
};

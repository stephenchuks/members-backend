// src/middleware/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrap an async route handler so that any thrown error is passed to next()
 */
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export const asyncHandler =
  (fn: AsyncHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

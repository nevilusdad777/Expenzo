import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_ERROR;

  logger.error(`${req.method} ${req.path} failed`, {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === HTTP_STATUS.INTERNAL_ERROR ? 'Internal server error' : err.message,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
}
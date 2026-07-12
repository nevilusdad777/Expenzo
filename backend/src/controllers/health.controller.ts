import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { getHealthStatus, verifyDatabasePipeline } from '../services/health.service';

export function healthCheck(req: Request, res: Response) {
  const health = getHealthStatus();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: health,
  });
}

export async function healthCheckDb(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await verifyDatabasePipeline();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
}
import { Request, Response, NextFunction } from 'express';
import * as reportsService from '../services/reports.service';
import { HTTP_STATUS } from '../config/constants';
import { ReportsQuery } from '../validators/reports.validator';

export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await reportsService.getFullReport(
      req.session!.userId,
      req.query as unknown as ReportsQuery
    );
    res.status(HTTP_STATUS.OK).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

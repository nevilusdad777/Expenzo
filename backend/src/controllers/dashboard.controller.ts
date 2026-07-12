import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { HTTP_STATUS } from '../config/constants';
import { DashboardQuery } from '../validators/dashboard.validator';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await dashboardService.getDashboardSummary(
      req.session!.userId,
      req.query as DashboardQuery
    );
    res.status(HTTP_STATUS.OK).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getUTCFullYear();
    const trend = await dashboardService.getMonthlyTrend(req.session!.userId, year);
    res.status(HTTP_STATUS.OK).json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
}

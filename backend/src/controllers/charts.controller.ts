import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../config/constants';
import * as chartsService from '../services/charts.service';

export async function getCategoryTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as {
      year: number;
      type: 'INCOME' | 'EXPENSE';
      limit?: number;
      categoryIds?: string[];
    };

    const trend = await chartsService.getCategoryTrend(req.session!.userId, {
      year: query.year,
      type: query.type,
      limit: query.limit ?? 5,
      categoryIds: query.categoryIds,
    });

    res.status(HTTP_STATUS.OK).json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
}

export async function getAccountBalanceTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as { year: number; limit?: number };
    const trend = await chartsService.getAccountBalanceTrend(req.session!.userId, {
      year: query.year,
      limit: query.limit ?? 5,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
}

export async function getYearlySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as { startYear?: number; endYear?: number };
    const currentYear = new Date().getUTCFullYear();
    const startYear = query.startYear ?? currentYear - 4;
    const endYear = query.endYear ?? currentYear;

    const summary = await chartsService.getYearlySummary(req.session!.userId, {
      startYear,
      endYear,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

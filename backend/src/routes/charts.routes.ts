import { Router } from 'express';
import * as chartsController from '../controllers/charts.controller';
import { validate } from '../middleware/validate';
import {
  accountBalanceTrendQuerySchema,
  categoryTrendQuerySchema,
  yearlySummaryQuerySchema,
} from '../validators/charts.validator';

const router = Router();

router.get(
  '/charts/category-trend',
  validate(categoryTrendQuerySchema, 'query'),
  chartsController.getCategoryTrend
);

router.get(
  '/charts/account-balance-trend',
  validate(accountBalanceTrendQuerySchema, 'query'),
  chartsController.getAccountBalanceTrend
);

router.get(
  '/charts/yearly-summary',
  validate(yearlySummaryQuerySchema, 'query'),
  chartsController.getYearlySummary
);

export default router;


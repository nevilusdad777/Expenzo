import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { validate } from '../middleware/validate';
import { dashboardQuerySchema } from '../validators/dashboard.validator';

const router = Router();

router.get(
  '/dashboard/summary',
  validate(dashboardQuerySchema, 'query'),
  dashboardController.getSummary
);
router.get('/dashboard/trend', dashboardController.getTrend);

export default router;

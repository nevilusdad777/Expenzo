import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { validate } from '../middleware/validate';
import { reportsQuerySchema } from '../validators/reports.validator';

const router = Router();

router.get('/reports', validate(reportsQuerySchema, 'query'), reportsController.getReport);

export default router;

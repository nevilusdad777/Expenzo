import { Router } from 'express';
import { healthCheck, healthCheckDb } from '../controllers/health.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/health/db', healthCheckDb);

export default router;
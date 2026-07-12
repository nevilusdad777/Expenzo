import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import categoryRoutes from './category.routes';
import transactionRoutes from './transaction.routes';
import dashboardRoutes from './dashboard.routes';
import chartsRoutes from './charts.routes';
import reportsRoutes from './reports.routes';
import adminAuthRoutes from './adminAuth.routes';
import { authGuard } from '../middleware/authGuard';

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);

// Admin panel routes — completely separate session & auth from users
router.use(adminAuthRoutes);

// User app routes — require user session
router.use(authGuard);
router.use(accountRoutes);
router.use(categoryRoutes);
router.use(transactionRoutes);
router.use(dashboardRoutes);
router.use(reportsRoutes);
router.use(chartsRoutes);

export default router;
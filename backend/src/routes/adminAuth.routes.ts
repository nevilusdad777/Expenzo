import { Router } from 'express';
import { adminGuard, optionalAdminAuth } from '../middleware/adminGuard';
import * as adminAuthController from '../controllers/adminAuth.controller';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// ─── Admin Auth (public — no guard needed) ────────────────────────────────────
router.post('/admin/auth/login', adminAuthController.adminLogin);
router.post('/admin/auth/logout', adminAuthController.adminLogout);
router.get('/admin/auth/me', optionalAdminAuth, adminAuthController.adminMe);

// ─── Admin Protected Routes ───────────────────────────────────────────────────
router.use(adminGuard);
router.post('/admin/auth/change-password', adminAuthController.adminChangePassword);

// User management
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.listUsers);
router.get('/admin/users/:id', adminController.getUserDetail);
router.patch('/admin/users/:id', adminController.updateUser);
router.post('/admin/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/admin/users/:id', adminController.deleteUser);

export default router;

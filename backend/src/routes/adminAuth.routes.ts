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
const adminProtected = Router();
adminProtected.use(adminGuard);

adminProtected.post('/auth/change-password', adminAuthController.adminChangePassword);

// User management
adminProtected.get('/stats', adminController.getStats);
adminProtected.get('/users', adminController.listUsers);
adminProtected.get('/users/:id', adminController.getUserDetail);
adminProtected.patch('/users/:id', adminController.updateUser);
adminProtected.post('/users/:id/reset-password', adminController.resetUserPassword);
adminProtected.delete('/users/:id', adminController.deleteUser);

router.use('/admin', adminProtected);

export default router;

import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { adminGuard } from '../middleware/adminGuard';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// All admin routes require both a valid session AND admin role
router.use(authGuard, adminGuard);

router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.listUsers);
router.get('/admin/users/:id', adminController.getUserDetail);
router.patch('/admin/users/:id', adminController.updateUser);
router.post('/admin/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/admin/users/:id', adminController.deleteUser);

export default router;

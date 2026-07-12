import { NextFunction, Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { HTTP_STATUS } from '../config/constants';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getStats();
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listUsers();
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getUserDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getUserDetail(req.params.id as string);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = adminService.updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const data = await adminService.updateUser(
      req.adminSession!.adminId,
      req.params.id as string,
      parsed.data
    );
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function resetUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = adminService.resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    await adminService.resetUserPassword(req.params.id as string, parsed.data.newPassword);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { message: 'Password updated successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteUser(req.adminSession!.adminId, req.params.id as string);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { message: 'User deleted.' } });
  } catch (err) {
    next(err);
  }
}

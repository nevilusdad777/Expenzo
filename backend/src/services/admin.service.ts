import * as adminRepo from '../repositories/admin.repository';
import * as userRepo from '../repositories/user.repository';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  emailVerified: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function getStats() {
  return adminRepo.getGlobalStats();
}

export async function listUsers() {
  return adminRepo.getAllUsers();
}

export async function getUserDetail(id: string) {
  const user = await adminRepo.getUserById(id);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return user;
}

export async function updateUser(
  _requestingAdminId: string,
  targetUserId: string,
  data: z.infer<typeof updateUserSchema>
) {
  const target = await userRepo.findById(targetUserId);
  if (!target) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  // If email is being changed, check it's not already taken
  if (data.email && data.email.toLowerCase() !== target.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw new AppError('That email is already in use', HTTP_STATUS.BAD_REQUEST);
  }

  return adminRepo.updateUser(targetUserId, data);
}

export async function resetUserPassword(targetUserId: string, newPassword: string) {
  const target = await userRepo.findById(targetUserId);
  if (!target) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  await adminRepo.resetUserPassword(targetUserId, newPassword);
}

export async function deleteUser(_requestingAdminId: string, targetUserId: string) {
  const target = await userRepo.findById(targetUserId);
  if (!target) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  await adminRepo.deleteUser(targetUserId);
}

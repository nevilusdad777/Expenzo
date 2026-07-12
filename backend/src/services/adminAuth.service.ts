import bcrypt from 'bcrypt';
import * as adminAccountRepo from '../repositories/adminAccount.repository';
import { issueAdminToken } from '../utils/adminSessionToken';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export async function adminLogin(email: string, password: string) {
  const admin = await adminAccountRepo.findAdminByEmail(email);
  if (!admin) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = issueAdminToken(admin.id);
  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
}

export async function getAdminMe(adminId: string) {
  const admin = await adminAccountRepo.findAdminById(adminId);
  if (!admin) throw new AppError('Admin not found', HTTP_STATUS.NOT_FOUND);
  return admin;
}

export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
) {
  const admin = await adminAccountRepo.findAdminByEmail(
    (await adminAccountRepo.findAdminById(adminId))?.email ?? ''
  );
  if (!admin) throw new AppError('Admin not found', HTTP_STATUS.NOT_FOUND);

  const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!isMatch) throw new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED);

  await adminAccountRepo.changeAdminPassword(adminId, newPassword);
}

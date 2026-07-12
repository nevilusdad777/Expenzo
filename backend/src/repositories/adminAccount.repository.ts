import { prisma } from './prismaClient';
import bcrypt from 'bcrypt';
import { env } from '../config/env';

export function findAdminByEmail(email: string) {
  return prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
}

export function findAdminById(id: string) {
  return prisma.admin.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export async function ensureDefaultAdmin() {
  const count = await prisma.admin.count();
  if (count > 0) return; // already seeded

  const passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, 12);
  await prisma.admin.create({
    data: {
      email: env.ADMIN_DEFAULT_EMAIL.toLowerCase(),
      name: 'Administrator',
      passwordHash,
    },
  });
  console.log(`[admin] Default admin created: ${env.ADMIN_DEFAULT_EMAIL}`);
  console.log(`[admin] Default password: ${env.ADMIN_DEFAULT_PASSWORD}`);
  console.log(`[admin] ⚠️  Change this password after first login!`);
}

export async function changeAdminPassword(id: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({ where: { id }, data: { passwordHash } });
}

export async function updateAdminProfile(id: string, data: { name?: string; email?: string }) {
  return prisma.admin.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email.toLowerCase() }),
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

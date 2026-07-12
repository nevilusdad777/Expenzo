import { prisma } from './prismaClient';

const CONFIG_ID = 1;

export function getConfig() {
  return prisma.appConfig.findUnique({ where: { id: CONFIG_ID } });
}

export function createConfig(pinHash: string) {
  return prisma.appConfig.create({
    data: { id: CONFIG_ID, pinHash },
  });
}

export function createConfigWithoutPin() {
  return prisma.appConfig.create({
    data: { id: CONFIG_ID },
  });
}

export function updatePinHash(pinHash: string) {
  return prisma.appConfig.update({
    where: { id: CONFIG_ID },
    data: { pinHash, failedAttempts: 0, lockedUntil: null },
  });
}

export function incrementFailedAttempts(count: number) {
  return prisma.appConfig.update({
    where: { id: CONFIG_ID },
    data: { failedAttempts: count },
  });
}

export function setLockout(lockedUntil: Date | null, resetAttempts = false) {
  return prisma.appConfig.update({
    where: { id: CONFIG_ID },
    data: {
      lockedUntil,
      ...(resetAttempts ? { failedAttempts: 0 } : {}),
    },
  });
}

export function updateAutoLockMinutes(minutes: number) {
  return prisma.appConfig.update({
    where: { id: CONFIG_ID },
    data: { autoLockMinutes: minutes },
  });
}
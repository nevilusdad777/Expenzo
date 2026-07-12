import { prisma } from './prismaClient';

const starterAccountId = 'starter-cash-account';

export async function createBalanceHistoryEntry() {
  return prisma.accountBalanceHistory.create({
    data: {
      accountId: starterAccountId,
      balance: 0,
    },
  });
}

export async function getLatestBalanceHistoryEntry() {
  return prisma.accountBalanceHistory.findFirst({
    where: { accountId: starterAccountId },
    orderBy: { recordedAt: 'desc' },
    include: {
      account: true,
    },
  });
}
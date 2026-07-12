import { prisma } from '../repositories/prismaClient';
import * as accountRepo from '../repositories/account.repository';
import { CreateAccountInput, UpdateAccountInput } from '../validators/account.validator';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export async function listAccounts(userId: string, includeArchived: boolean) {
  return accountRepo.findAllAccounts(userId, includeArchived);
}

export async function getAccount(userId: string, id: string) {
  const account = await accountRepo.findAccountById(userId, id);
  if (!account) {
    throw new AppError('Account not found', HTTP_STATUS.NOT_FOUND);
  }
  return account;
}

export async function addAccount(userId: string, data: CreateAccountInput) {
  return prisma.$transaction(async (tx) => {
    const account = await accountRepo.createAccount(tx, userId, data);
    await accountRepo.recordBalanceSnapshot(tx, account.id, account.balance);
    return account;
  });
}

export async function editAccount(userId: string, id: string, data: UpdateAccountInput) {
  const existing = await getAccount(userId, id);

  return prisma.$transaction(async (tx) => {
    const account = await accountRepo.updateAccount(tx, userId, id, data);

    if (data.balance !== undefined && data.balance !== existing.balance) {
      await accountRepo.recordBalanceSnapshot(tx, account.id, account.balance);
    }

    return account;
  });
}

export async function archiveAccountById(userId: string, id: string) {
  await getAccount(userId, id);
  return accountRepo.archiveAccount(prisma, userId, id);
}

export async function unarchiveAccountById(userId: string, id: string) {
  await getAccount(userId, id);
  return accountRepo.unarchiveAccount(prisma, userId, id);
}

export async function deleteAccountById(userId: string, id: string) {
  await getAccount(userId, id);
  const txCount = await accountRepo.countTransactionsForAccount(userId, id);
  if (txCount > 0) {
    throw new AppError(
      `Cannot delete account with ${txCount} existing transaction(s). Archive it instead.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  return accountRepo.deleteAccountHard(prisma, userId, id);
}

export async function getAccountBalanceHistory(userId: string, id: string, limit = 30) {
  await getAccount(userId, id);
  return accountRepo.getBalanceHistory(userId, id, Math.min(Math.max(limit, 1), 100));
}

import { prisma } from '../repositories/prismaClient';
import * as txRepo from '../repositories/transaction.repository';
import * as accountRepo from '../repositories/account.repository';
import {
  CreateTransactionInput,
  TransactionQuery,
  UpdateTransactionInput,
} from '../validators/transaction.validator';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { parsePaginationParams, toPaginatedResult } from '../utils/pagination';

async function assertAccountExists(userId: string, id: string) {
  const account = await accountRepo.findAccountById(userId, id);
  if (!account) throw new AppError(`Account ${id} not found`, HTTP_STATUS.BAD_REQUEST);
  return account;
}

function balanceDeltaForType(type: CreateTransactionInput['type'], amount: number) {
  if (type === 'INCOME') return amount;
  return -amount;
}

function reverseDeltaForType(type: CreateTransactionInput['type'], amount: number) {
  return -balanceDeltaForType(type, amount);
}

function assertValidMergedTransaction(input: CreateTransactionInput) {
  if (input.type === 'TRANSFER') {
    if (!input.toAccountId) {
      throw new AppError('toAccountId is required for transfers', HTTP_STATUS.BAD_REQUEST);
    }
    if (input.toAccountId === input.accountId) {
      throw new AppError('Cannot transfer to the same account', HTTP_STATUS.BAD_REQUEST);
    }
  } else if (!input.categoryId) {
    throw new AppError('categoryId is required for income/expense', HTTP_STATUS.BAD_REQUEST);
  }
}

async function assertAccountsExist(userId: string, ids: Array<string | undefined>) {
  const uniqueIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  await Promise.all(uniqueIds.map((id) => assertAccountExists(userId, id)));
}

export async function listTransactions(userId: string, query: TransactionQuery) {
  const pagination = parsePaginationParams(query as unknown as Record<string, unknown>);
  const rows = await txRepo.findTransactions(userId, query, pagination.limit ?? 25);
  return toPaginatedResult(rows, pagination.limit ?? 25);
}

export async function getTransaction(userId: string, id: string) {
  const transaction = await txRepo.findTransactionById(userId, id);
  if (!transaction) throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND);
  return transaction;
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  await assertAccountsExist(userId, [input.accountId, input.toAccountId]);
  assertValidMergedTransaction(input);

  return prisma.$transaction(async (tx) => {
    const { tags, ...rest } = input;

    const record = await txRepo.createTransactionRecord(tx, {
      ...rest,
      userId,
      tags: JSON.stringify(tags ?? []),
    });

    const sourceDelta = balanceDeltaForType(input.type, input.amount);
    const sourceAccount = await txRepo.incrementAccountBalance(
      tx,
      userId,
      input.accountId,
      sourceDelta
    );
    await txRepo.recordBalanceSnapshot(tx, input.accountId, sourceAccount.balance);

    if (input.type === 'TRANSFER' && input.toAccountId) {
      const destAccount = await txRepo.incrementAccountBalance(
        tx,
        userId,
        input.toAccountId,
        input.amount
      );
      await txRepo.recordBalanceSnapshot(tx, input.toAccountId, destAccount.balance);
    }

    return record;
  });
}

export async function editTransaction(userId: string, id: string, input: UpdateTransactionInput) {
  const existing = await getTransaction(userId, id);

  const merged: CreateTransactionInput = {
    type: (input.type ?? existing.type) as CreateTransactionInput['type'],
    amount: input.amount ?? existing.amount,
    date: input.date ?? existing.date,
    accountId: input.accountId ?? existing.accountId,
    toAccountId: input.toAccountId ?? existing.toAccountId ?? undefined,
    categoryId: input.categoryId ?? existing.categoryId ?? undefined,
    description: input.description ?? existing.description ?? undefined,
    paymentMethod: input.paymentMethod ?? existing.paymentMethod ?? undefined,
    referenceNumber: input.referenceNumber ?? existing.referenceNumber ?? undefined,
    tags: input.tags ?? (existing.tags ? JSON.parse(existing.tags) : []),
  };

  assertValidMergedTransaction(merged);
  await assertAccountsExist(userId, [
    existing.accountId,
    existing.toAccountId ?? undefined,
    merged.accountId,
    merged.toAccountId,
  ]);

  return prisma.$transaction(async (tx) => {
    const reversedSource = await txRepo.incrementAccountBalance(
      tx,
      userId,
      existing.accountId,
      reverseDeltaForType(existing.type, existing.amount)
    );
    await txRepo.recordBalanceSnapshot(tx, existing.accountId, reversedSource.balance);

    if (existing.type === 'TRANSFER' && existing.toAccountId) {
      const reversedDest = await txRepo.incrementAccountBalance(
        tx,
        userId,
        existing.toAccountId,
        -existing.amount
      );
      await txRepo.recordBalanceSnapshot(tx, existing.toAccountId, reversedDest.balance);
    }

    const record = await txRepo.updateTransactionRecord(tx, userId, id, {
      type: merged.type,
      amount: merged.amount,
      date: merged.date,
      accountId: merged.accountId,
      toAccountId: merged.type === 'TRANSFER' ? merged.toAccountId : null,
      categoryId: merged.type === 'TRANSFER' ? null : merged.categoryId,
      description: merged.description,
      paymentMethod: merged.paymentMethod,
      referenceNumber: merged.referenceNumber,
      tags: JSON.stringify(merged.tags ?? []),
    });

    const forwardSource = await txRepo.incrementAccountBalance(
      tx,
      userId,
      merged.accountId,
      balanceDeltaForType(merged.type, merged.amount)
    );
    await txRepo.recordBalanceSnapshot(tx, merged.accountId, forwardSource.balance);

    if (merged.type === 'TRANSFER' && merged.toAccountId) {
      const forwardDest = await txRepo.incrementAccountBalance(
        tx,
        userId,
        merged.toAccountId,
        merged.amount
      );
      await txRepo.recordBalanceSnapshot(tx, merged.toAccountId, forwardDest.balance);
    }

    return record;
  });
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await getTransaction(userId, id);

  return prisma.$transaction(async (tx) => {
    const reversedSource = await txRepo.incrementAccountBalance(
      tx,
      userId,
      existing.accountId,
      reverseDeltaForType(existing.type, existing.amount)
    );
    await txRepo.recordBalanceSnapshot(tx, existing.accountId, reversedSource.balance);

    if (existing.type === 'TRANSFER' && existing.toAccountId) {
      const reversedDest = await txRepo.incrementAccountBalance(
        tx,
        userId,
        existing.toAccountId,
        -existing.amount
      );
      await txRepo.recordBalanceSnapshot(tx, existing.toAccountId, reversedDest.balance);
    }

    await txRepo.deleteTransactionRecord(tx, userId, id);
  });
}

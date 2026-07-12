import { z } from 'zod';

export const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);

const baseTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.coerce.date(),
  accountId: z.string().min(1),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().max(200).optional(),
  paymentMethod: z.string().max(50).optional(),
  referenceNumber: z.string().max(100).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export const createTransactionSchema = baseTransactionSchema.superRefine((data, ctx) => {
  if (data.type === 'TRANSFER') {
    if (!data.toAccountId) {
      ctx.addIssue({ code: 'custom', message: 'toAccountId is required for transfers', path: ['toAccountId'] });
    }

    if (data.toAccountId === data.accountId) {
      ctx.addIssue({ code: 'custom', message: 'Cannot transfer to the same account', path: ['toAccountId'] });
    }
  } else if (!data.categoryId) {
    ctx.addIssue({ code: 'custom', message: 'categoryId is required for income/expense', path: ['categoryId'] });
  }
});

export const updateTransactionSchema = baseTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  type: transactionTypeEnum.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
});

export const transactionIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
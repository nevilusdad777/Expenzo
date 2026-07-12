import { z } from 'zod';

export const accountTypeEnum = z.enum(['CASH', 'BANK', 'WALLET', 'CREDIT_CARD', 'INVESTMENT', 'OTHER']);

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: accountTypeEnum.default('OTHER'),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex code').optional(),
  balance: z.number().finite().default(0),
});

export const updateAccountSchema = createAccountSchema.partial();

export const accountIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listAccountsQuerySchema = z.object({
  includeArchived: z.enum(['true', 'false']).optional().transform((value) => value === 'true'),
});

export const getAccountBalanceHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
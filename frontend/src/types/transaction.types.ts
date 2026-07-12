export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  description: string | null;
  paymentMethod: string | null;
  referenceNumber: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  account: { id: string; name: string; icon: string | null };
  toAccount: { id: string; name: string } | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  date: string | Date;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  description?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  tags?: string[];
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

export interface TransactionQuery {
  cursor?: string;
  limit?: number;
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  nextCursor: string | null;
  hasMore: boolean;
}

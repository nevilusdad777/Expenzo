import { apiClient } from './apiClient';
import type {
  CreateTransactionInput,
  PaginatedTransactions,
  Transaction,
  TransactionQuery,
  UpdateTransactionInput,
} from '@/types/transaction.types';

export async function fetchTransactions(query: TransactionQuery): Promise<PaginatedTransactions> {
  const res = await apiClient.get<{
    data: Transaction[];
    meta: { nextCursor: string | null; hasMore: boolean };
  }>('/api/transactions', { params: query });

  return {
    items: res.data.data,
    nextCursor: res.data.meta.nextCursor,
    hasMore: res.data.meta.hasMore,
  };
}

export async function fetchTransaction(id: string) {
  const res = await apiClient.get<{ data: Transaction }>(`/api/transactions/${id}`);
  return res.data.data;
}

export async function createTransaction(input: CreateTransactionInput) {
  const res = await apiClient.post<{ data: Transaction }>('/api/transactions', input);
  return res.data.data;
}

export async function updateTransaction(id: string, input: UpdateTransactionInput) {
  const res = await apiClient.patch<{ data: Transaction }>(`/api/transactions/${id}`, input);
  return res.data.data;
}

export async function deleteTransaction(id: string) {
  await apiClient.delete(`/api/transactions/${id}`);
}

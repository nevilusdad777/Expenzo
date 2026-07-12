import { apiClient } from './apiClient';
import { Account, AccountBalanceHistoryPoint } from '@/types/account.types';

export async function fetchAccounts(includeArchived = false) {
  const res = await apiClient.get<{ data: Account[] }>('/api/accounts', {
    params: { includeArchived },
  });
  return res.data.data;
}

export async function fetchAccount(id: string) {
  const res = await apiClient.get<{ data: Account }>(`/api/accounts/${id}`);
  return res.data.data;
}

export async function fetchAccountBalanceHistory(id: string, limit = 30) {
  const res = await apiClient.get<{ data: AccountBalanceHistoryPoint[] }>(
    `/api/accounts/${id}/balance-history`,
    { params: { limit } }
  );
  return res.data.data;
}

export interface CreateAccountInput {
  name: string;
  type: Account['type'];
  icon?: string;
  color?: string;
  balance?: number;
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {}

export async function createAccount(input: CreateAccountInput) {
  const res = await apiClient.post<{ data: Account }>('/api/accounts', input);
  return res.data.data;
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const res = await apiClient.patch<{ data: Account }>(`/api/accounts/${id}`, input);
  return res.data.data;
}

export async function archiveAccount(id: string) {
  const res = await apiClient.patch<{ data: Account }>(`/api/accounts/${id}/archive`);
  return res.data.data;
}

export async function unarchiveAccount(id: string) {
  const res = await apiClient.patch<{ data: Account }>(`/api/accounts/${id}/unarchive`);
  return res.data.data;
}

export async function deleteAccount(id: string) {
  await apiClient.delete(`/api/accounts/${id}`);
}


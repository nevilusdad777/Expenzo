import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveAccount,
  createAccount,
  deleteAccount,
  fetchAccount,
  fetchAccountBalanceHistory,
  fetchAccounts,
  unarchiveAccount,
  updateAccount,
  type CreateAccountInput,
  type UpdateAccountInput,
} from '@/services/accountsApi';

import { useAuth } from '@/context/AuthContext';

export function useAccounts(includeArchived = false) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['accounts', user?.id, { includeArchived }],
    queryFn: () => fetchAccounts(includeArchived),
    enabled: Boolean(user?.id),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => fetchAccount(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAccountBalanceHistory(id: string, limit = 30) {
  return useQuery({
    queryKey: ['accounts', id, 'balanceHistory', limit],
    queryFn: () => fetchAccountBalanceHistory(id, limit),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => createAccount(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAccountInput) => updateAccount(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUnarchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unarchiveAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

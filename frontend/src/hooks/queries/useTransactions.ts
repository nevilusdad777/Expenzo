import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  deleteTransaction,
  fetchTransaction,
  fetchTransactions,
  updateTransaction,
} from '@/services/transactionsApi';
import type {
  CreateTransactionInput,
  TransactionQuery,
  UpdateTransactionInput,
} from '@/types/transaction.types';
import type { DashboardSummary } from '@/types/dashboard.types';

export function useTransactions(query: Omit<TransactionQuery, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: ['transactions', query],
    queryFn: ({ pageParam }) => fetchTransactions({ ...query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => fetchTransaction(id),
    enabled: Boolean(id),
  });
}

// Helper to get today's month/year for matching dashboard cache key
function getNowMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(input),

    // ─── Optimistic Update ────────────────────────────────────────────────────
    // Instantly update dashboard numbers in the cache BEFORE the server responds.
    // User sees instant feedback — balance, income/expense totals update in <50ms.
    onMutate: async (input) => {
      const { month, year } = getNowMonthYear();
      const dashKey = ['dashboard', 'summary', undefined, undefined];

      // Cancel any in-flight refetches so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: dashKey });

      // Snapshot the current dashboard state so we can roll back on error
      const previousDashboard = queryClient.getQueryData<DashboardSummary>(dashKey);

      // Apply optimistic update to dashboard
      if (previousDashboard && input.type !== 'TRANSFER') {
        const isCurrentMonth = (() => {
          const d = new Date(input.date);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        })();

        queryClient.setQueryData<DashboardSummary>(dashKey, (old) => {
          if (!old) return old;
          const isIncome = input.type === 'INCOME';
          const delta = input.amount;

          return {
            ...old,
            totalBalance: old.totalBalance + (isIncome ? delta : -delta),
            totalIncome: old.totalIncome + (isIncome ? delta : 0),
            totalExpense: old.totalExpense + (!isIncome ? delta : 0),
            monthlyIncome: isCurrentMonth
              ? old.monthlyIncome + (isIncome ? delta : 0)
              : old.monthlyIncome,
            monthlyExpense: isCurrentMonth
              ? old.monthlyExpense + (!isIncome ? delta : 0)
              : old.monthlyExpense,
            netSavings: isCurrentMonth
              ? old.netSavings + (isIncome ? delta : -delta)
              : old.netSavings,
          };
        });
      }

      // Return snapshot for rollback
      return { previousDashboard, dashKey };
    },

    // ─── Rollback on error ────────────────────────────────────────────────────
    onError: (_err, _input, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(context.dashKey, context.previousDashboard);
      }
    },

    // ─── After server confirms ─────────────────────────────────────────────────
    // Refetch in background to get accurate server data (for recent txns, categories etc.)
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTransactionInput) => updateTransaction(id, input),

    onMutate: async (input) => {
      const dashKey = ['dashboard', 'summary', undefined, undefined];
      await queryClient.cancelQueries({ queryKey: dashKey });
      const previousDashboard = queryClient.getQueryData<DashboardSummary>(dashKey);
      return { previousDashboard, dashKey };
    },

    onError: (_err, _input, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(context.dashKey, context.previousDashboard);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),

    onMutate: async () => {
      const dashKey = ['dashboard', 'summary', undefined, undefined];
      await queryClient.cancelQueries({ queryKey: dashKey });
      const previousDashboard = queryClient.getQueryData<DashboardSummary>(dashKey);
      return { previousDashboard, dashKey };
    },

    onError: (_err, _id, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(context.dashKey, context.previousDashboard);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

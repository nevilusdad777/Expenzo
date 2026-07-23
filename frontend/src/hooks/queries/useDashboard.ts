import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchMonthlyTrend } from '@/services/dashboardApi';
import { useAuth } from '@/context/AuthContext';

export function useDashboardSummary(month?: number, year?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboard', 'summary', user?.id, month, year],
    queryFn: () => fetchDashboardSummary(month, year),
    enabled: Boolean(user?.id),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useMonthlyTrend(year: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboard', 'trend', user?.id, year],
    queryFn: () => fetchMonthlyTrend(year),
    enabled: Boolean(user?.id),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

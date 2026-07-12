import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchMonthlyTrend } from '@/services/dashboardApi';

export function useDashboardSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    queryFn: () => fetchDashboardSummary(month, year),
  });
}

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: ['dashboard', 'trend', year],
    queryFn: () => fetchMonthlyTrend(year),
  });
}

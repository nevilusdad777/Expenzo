import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchMonthlyTrend } from '@/services/dashboardApi';

export function useDashboardSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    queryFn: () => fetchDashboardSummary(month, year),
    staleTime: 1000 * 60 * 5,  // 5 minutes — dashboard data doesn't need frequent refresh
    gcTime: 1000 * 60 * 15,    // 15 minutes in memory
  });
}

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: ['dashboard', 'trend', year],
    queryFn: () => fetchMonthlyTrend(year),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 15,    // 15 minutes
  });
}

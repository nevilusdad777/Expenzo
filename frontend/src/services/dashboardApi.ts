import { apiClient } from './apiClient';
import { DashboardSummary, MonthlyTrendPoint } from '@/types/dashboard.types';

export async function fetchDashboardSummary(month?: number, year?: number) {
  const res = await apiClient.get<{ data: DashboardSummary }>('/api/dashboard/summary', {
    params: { month, year },
  });
  return res.data.data;
}

export async function fetchMonthlyTrend(year: number) {
  const res = await apiClient.get<{ data: MonthlyTrendPoint[] }>('/api/dashboard/trend', {
    params: { year },
  });
  return res.data.data;
}

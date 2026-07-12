import { useQuery } from '@tanstack/react-query';
import {
  fetchAccountBalanceTrend,
  fetchCategoryTrend,
  fetchYearlySummary,
} from '@/services/chartsApi';
import type { ChartType } from '@/types/charts.types';

export function useYearlySummary(startYear: number, endYear: number) {
  return useQuery({
    queryKey: ['charts', 'yearly-summary', startYear, endYear],
    queryFn: () => fetchYearlySummary(startYear, endYear),
  });
}

export function useCategoryTrend(year: number, type: ChartType, limit = 5) {
  return useQuery({
    queryKey: ['charts', 'category-trend', year, type, limit],
    queryFn: () => fetchCategoryTrend(year, type, limit),
    enabled: Boolean(year) && Boolean(type),
  });
}

export function useAccountBalanceTrend(year: number, limit = 5) {
  return useQuery({
    queryKey: ['charts', 'account-balance-trend', year, limit],
    queryFn: () => fetchAccountBalanceTrend(year, limit),
    enabled: Boolean(year),
  });
}


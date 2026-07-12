import { apiClient } from './apiClient';
import type {
  AccountBalanceTrendResponse,
  CategoryTrendResponse,
  YearlySummaryResponse,
  ChartType,
} from '@/types/charts.types';

export async function fetchCategoryTrend(
  year: number,
  type: ChartType,
  limit = 5,
  categoryIds?: string[]
) {
  const res = await apiClient.get<{ data: CategoryTrendResponse }>(
    '/api/charts/category-trend',
    {
      params: {
        year,
        type,
        limit,
        ...(categoryIds && categoryIds.length ? { categoryIds: categoryIds.join(',') } : {}),
      },
    }
  );
  return res.data.data;
}

export async function fetchAccountBalanceTrend(
  year: number,
  limit = 5
) {
  const res = await apiClient.get<{ data: AccountBalanceTrendResponse }>(
    '/api/charts/account-balance-trend',
    { params: { year, limit } }
  );
  return res.data.data;
}

export async function fetchYearlySummary(startYear: number, endYear: number) {
  const res = await apiClient.get<{ data: YearlySummaryResponse }>(
    '/api/charts/yearly-summary',
    { params: { startYear, endYear } }
  );
  return res.data.data;
}


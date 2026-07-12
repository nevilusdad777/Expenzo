import { apiClient } from './apiClient';
import type { FullReport, ReportGroupBy } from '@/types/reports.types';

export async function fetchReport(startDate: string, endDate: string, groupBy: ReportGroupBy) {
  const res = await apiClient.get<{ data: FullReport }>('/api/reports', {
    params: { startDate, endDate, groupBy },
  });
  return res.data.data;
}

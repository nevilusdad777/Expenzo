import { useQuery } from '@tanstack/react-query';
import { fetchReport } from '@/services/reportsApi';
import type { ReportGroupBy } from '@/types/reports.types';

export function useReport(startDate: string, endDate: string, groupBy: ReportGroupBy) {
  return useQuery({
    queryKey: ['reports', startDate, endDate, groupBy],
    queryFn: () => fetchReport(startDate, endDate, groupBy),
    enabled: Boolean(startDate && endDate),
  });
}

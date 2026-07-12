import { Card } from '@/components/ui';
import { ReportCategoryStat } from '@/types/reports.types';
import { formatCurrency } from '@/utils/formatters';

interface CategoryReportTableProps {
  title: string;
  data: ReportCategoryStat[];
  emptyMessage: string;
}

export function CategoryReportTable({ title, data, emptyMessage }: CategoryReportTableProps) {
  return (
    <Card padding="none">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
      </div>
      {data.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <div className="scrollbar-thin max-h-72 overflow-y-auto">
          {data.map((row) => (
            <div
              key={row.categoryId}
              className="flex items-center justify-between border-t border-border px-4 py-3 first:border-t-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: row.color ?? '#6366f1' }}
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">{row.name}</p>
                  <p className="text-xs text-text-muted">{row.count} transactions · {row.percentage}%</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-text-primary">{formatCurrency(row.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

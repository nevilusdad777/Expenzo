import { Card } from '@/components/ui';
import { ReportAccountStat } from '@/types/reports.types';
import { formatCurrency } from '@/utils/formatters';

interface AccountReportTableProps {
  data: ReportAccountStat[];
}

export function AccountReportTable({ data }: AccountReportTableProps) {
  return (
    <Card padding="none">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-text-secondary">Account Report</h3>
      </div>
      {data.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-text-muted">No account activity in this period.</p>
      ) : (
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-t border-border text-xs text-text-muted">
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Income</th>
                <th className="px-4 py-2 font-medium">Expense</th>
                <th className="px-4 py-2 font-medium">Net</th>
                <th className="px-4 py-2 font-medium">Transfers</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.accountId} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
                  <td className="px-4 py-3 text-success">{formatCurrency(row.income)}</td>
                  <td className="px-4 py-3 text-danger">{formatCurrency(row.expense)}</td>
                  <td
                    className={`px-4 py-3 font-medium ${row.net >= 0 ? 'text-success' : 'text-danger'}`}
                  >
                    {formatCurrency(row.net)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    In {formatCurrency(row.transferIn)} · Out {formatCurrency(row.transferOut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

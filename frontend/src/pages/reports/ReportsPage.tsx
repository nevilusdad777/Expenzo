import { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { AccountReportTable } from '@/components/reports/AccountReportTable';
import { CashFlowReportChart } from '@/components/reports/CashFlowReportChart';
import { CategoryReportTable } from '@/components/reports/CategoryReportTable';
import { ReportSummaryCards } from '@/components/reports/ReportSummaryCards';
import { useReport } from '@/hooks/queries/useReports';
import type { ReportGroupBy } from '@/types/reports.types';
import { DatePreset, getDateRange } from '@/utils/dateRanges';
import { exportReportToCsv } from '@/utils/exportCsv';

const DATE_PRESETS: Array<{ value: DatePreset; label: string }> = [
  { value: 'today', label: 'Daily' },
  { value: 'this_week', label: 'Weekly' },
  { value: 'this_month', label: 'Monthly' },
  { value: 'this_year', label: 'Yearly' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

const GROUP_OPTIONS: Array<{ value: ReportGroupBy; label: string }> = [
  { value: 'day', label: 'By Day' },
  { value: 'week', label: 'By Week' },
  { value: 'month', label: 'By Month' },
];

type ReportTab = 'overview' | 'income' | 'expense' | 'accounts' | 'cashflow';

export function ReportsPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('day');
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  const range = useMemo(
    () => getDateRange(datePreset, customStart, customEnd),
    [datePreset, customStart, customEnd]
  );

  const startDate = range.startDate?.toISOString() ?? new Date(0).toISOString();
  const endDate = range.endDate?.toISOString() ?? new Date().toISOString();

  const { data: report, isLoading, isError } = useReport(startDate, endDate, groupBy);

  const handleExport = () => {
    if (!report) return;
    exportReportToCsv(report);
    toast.success('Report exported as CSV');
  };

  const tabs: Array<{ id: ReportTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'cashflow', label: 'Cash Flow' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
          <p className="text-sm text-text-secondary">
            Income, expense, category, account, and cash flow analysis.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={!report}>
          <FiDownload />
          Export CSV
        </Button>
      </div>

      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
            className="rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as ReportGroupBy)}
            className="rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {GROUP_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {datePreset === 'custom' ? (
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" label="From" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <Input type="date" label="To" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        ) : null}
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-text-secondary">Generating report…</div>
      ) : isError || !report ? (
        <div className="text-sm text-danger">Failed to load report.</div>
      ) : (
        <>
          {(activeTab === 'overview' || activeTab === 'income' || activeTab === 'expense') && (
            <ReportSummaryCards summary={report.summary} />
          )}

          {activeTab === 'overview' && <CashFlowReportChart data={report.cashFlow} />}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CategoryReportTable
                title="Top Expense Categories"
                data={report.expenseByCategory.slice(0, 8)}
                emptyMessage="No expenses in this period."
              />
              <CategoryReportTable
                title="Top Income Categories"
                data={report.incomeByCategory.slice(0, 8)}
                emptyMessage="No income in this period."
              />
            </div>
          )}

          {activeTab === 'income' && (
            <CategoryReportTable
              title="Income Report by Category"
              data={report.incomeByCategory}
              emptyMessage="No income in this period."
            />
          )}

          {activeTab === 'expense' && (
            <CategoryReportTable
              title="Expense Report by Category"
              data={report.expenseByCategory}
              emptyMessage="No expenses in this period."
            />
          )}

          {activeTab === 'accounts' && <AccountReportTable data={report.byAccount} />}

          {activeTab === 'cashflow' && <CashFlowReportChart data={report.cashFlow} />}
        </>
      )}
    </div>
  );
}

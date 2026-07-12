import type { FullReport } from '@/types/reports.types';

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const content = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportReportToCsv(report: FullReport) {
  const rows: Array<Array<string | number>> = [
    ['Expenzo - Report'],
    ['Period Start', report.period.startDate],
    ['Period End', report.period.endDate],
    [],
    ['Summary'],
    ['Total Income', report.summary.totalIncome],
    ['Total Expense', report.summary.totalExpense],
    ['Net Savings', report.summary.netSavings],
    ['Transaction Count', report.summary.transactionCount],
    ['Avg Daily Spending', report.summary.avgDailySpending],
    ['Savings Rate %', report.summary.savingsRate],
    [],
    ['Expense by Category', 'Amount', 'Count', 'Percentage'],
    ...report.expenseByCategory.map((c) => [c.name, c.amount, c.count, `${c.percentage}%`]),
    [],
    ['Income by Category', 'Amount', 'Count', 'Percentage'],
    ...report.incomeByCategory.map((c) => [c.name, c.amount, c.count, `${c.percentage}%`]),
    [],
    ['Account Report', 'Income', 'Expense', 'Net', 'Transfer In', 'Transfer Out', 'Count'],
    ...report.byAccount.map((a) => [
      a.name,
      a.income,
      a.expense,
      a.net,
      a.transferIn,
      a.transferOut,
      a.count,
    ]),
    [],
    ['Cash Flow', 'Income', 'Expense', 'Net'],
    ...report.cashFlow.map((p) => [p.period, p.income, p.expense, p.net]),
  ];

  const start = report.period.startDate.slice(0, 10);
  const end = report.period.endDate.slice(0, 10);
  downloadCsv(`finance-report-${start}-to-${end}.csv`, rows);
}

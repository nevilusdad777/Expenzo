import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

export type DatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

const weekOptions = { weekStartsOn: 1 as const };

export function getDateRange(
  preset: DatePreset,
  customStart?: string,
  customEnd?: string
): DateRange {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case 'yesterday': {
      const day = subDays(now, 1);
      return { startDate: startOfDay(day), endDate: endOfDay(day) };
    }
    case 'this_week':
      return { startDate: startOfWeek(now, weekOptions), endDate: endOfWeek(now, weekOptions) };
    case 'last_week': {
      const lastWeek = subWeeks(now, 1);
      return {
        startDate: startOfWeek(lastWeek, weekOptions),
        endDate: endOfWeek(lastWeek, weekOptions),
      };
    }
    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
    }
    case 'this_year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };
    case 'custom':
      return {
        startDate: customStart ? startOfDay(new Date(customStart)) : undefined,
        endDate: customEnd ? endOfDay(new Date(customEnd)) : undefined,
      };
    default:
      return {};
  }
}

export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags) as unknown;
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

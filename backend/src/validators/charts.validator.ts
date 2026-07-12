import { z } from 'zod';

export const chartTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const categoryTrendQuerySchema = z.object({
  year: z.coerce.number().min(2000).max(2100),
  type: chartTypeEnum,
  limit: z.coerce.number().min(1).max(10).optional(),
  categoryIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
      return value;
    }),
});

export const accountBalanceTrendQuerySchema = z.object({
  year: z.coerce.number().min(2000).max(2100),
  limit: z.coerce.number().min(1).max(10).optional(),
});

export const yearlySummaryQuerySchema = z.object({
  startYear: z.coerce.number().min(2000).max(2100).optional(),
  endYear: z.coerce.number().min(2000).max(2100).optional(),
});

export type CategoryTrendQuery = z.infer<typeof categoryTrendQuerySchema>;
export type AccountBalanceTrendQuery = z.infer<typeof accountBalanceTrendQuerySchema>;
export type YearlySummaryQuery = z.infer<typeof yearlySummaryQuerySchema>;


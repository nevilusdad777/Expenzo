import { z } from 'zod';

export const reportsQuerySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  });

export type ReportsQuery = z.infer<typeof reportsQuerySchema>;

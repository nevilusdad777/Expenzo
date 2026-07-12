import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

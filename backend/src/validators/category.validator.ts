import { z } from 'zod';

export const categoryTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  type: categoryTypeEnum,
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ type: true });

export const categoryIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listCategoriesQuerySchema = z.object({
  type: categoryTypeEnum.optional(),
});

export const deleteCategoryQuerySchema = z.object({
  force: z.enum(['true', 'false']).optional().transform((value) => value === 'true'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
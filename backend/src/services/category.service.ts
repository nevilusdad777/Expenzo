import { prisma } from '../repositories/prismaClient';
import * as categoryRepo from '../repositories/category.repository';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

/**
 * Ensures 'Other' category exists for both INCOME and EXPENSE.
 * Runs upsert — idempotent, safe to call every time categories are fetched.
 * This migrates existing users who registered before 'Other' was added.
 */
async function ensureOtherCategories(userId: string) {
  const upsertOther = (type: 'INCOME' | 'EXPENSE') =>
    prisma.category.upsert({
      where: {
        // Use a unique deterministic id so we never duplicate
        id: `${userId}-${type.toLowerCase()}-other`,
      },
      update: {}, // Already exists — no change needed
      create: {
        id: `${userId}-${type.toLowerCase()}-other`,
        userId,
        name: 'Other',
        type,
        icon: 'more_horiz',
        color: '#918fa1',
        isDefault: true,
      },
    });

  await Promise.all([upsertOther('INCOME'), upsertOther('EXPENSE')]);
}

export async function listCategories(userId: string, type?: 'INCOME' | 'EXPENSE') {
  // Auto-provision 'Other' for existing users who didn't have it yet
  await ensureOtherCategories(userId);
  return categoryRepo.findAllCategories(userId, type);
}

export async function getCategory(userId: string, id: string) {
  const category = await categoryRepo.findCategoryById(userId, id);
  if (!category) throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  return category;
}

export async function addCategory(userId: string, data: CreateCategoryInput) {
  if (data.parentId) {
    const parent = await categoryRepo.findCategoryById(userId, data.parentId);
    if (!parent) throw new AppError('Parent category not found', HTTP_STATUS.BAD_REQUEST);
    if (parent.type !== data.type) {
      throw new AppError('Subcategory must match parent category type', HTTP_STATUS.BAD_REQUEST);
    }
  }
  return categoryRepo.createCategory(userId, data);
}

export async function editCategory(userId: string, id: string, data: UpdateCategoryInput) {
  const existing = await getCategory(userId, id);
  if (existing.isDefault && data.name) {
    throw new AppError('Default categories cannot be renamed', HTTP_STATUS.BAD_REQUEST);
  }
  if (data.parentId) {
    const parent = await categoryRepo.findCategoryById(userId, data.parentId);
    if (!parent) throw new AppError('Parent category not found', HTTP_STATUS.BAD_REQUEST);
    if (parent.type !== existing.type) {
      throw new AppError('Subcategory must match parent category type', HTTP_STATUS.BAD_REQUEST);
    }
  }
  return categoryRepo.updateCategory(userId, id, data);
}

export async function removeCategory(userId: string, id: string, force: boolean) {
  const category = await getCategory(userId, id);
  if (category.isDefault) {
    throw new AppError('Default categories cannot be deleted', HTTP_STATUS.BAD_REQUEST);
  }
  const txCount = await categoryRepo.countTransactionsForCategory(userId, id);
  if (txCount > 0 && !force) {
    throw new AppError(
      `${txCount} transaction(s) use this category. Pass force=true to delete anyway (they will become uncategorized).`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  return categoryRepo.deleteCategory(userId, id);
}

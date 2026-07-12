import { prisma } from './prismaClient';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export function findAllCategories(userId: string, type?: 'INCOME' | 'EXPENSE') {
  return prisma.category.findMany({
    where: { userId, ...(type ? { type } : {}) },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}

export function findCategoryById(userId: string, id: string) {
  return prisma.category.findFirst({ where: { id, userId }, include: { children: true } });
}

export function createCategory(userId: string, data: CreateCategoryInput) {
  return prisma.category.create({ data: { ...data, userId, isDefault: false } });
}

export function updateCategory(userId: string, id: string, data: UpdateCategoryInput) {
  return prisma.category.update({ where: { id, userId }, data });
}

export function deleteCategory(userId: string, id: string) {
  return prisma.category.delete({ where: { id, userId } });
}

export function countTransactionsForCategory(userId: string, id: string) {
  return prisma.transaction.count({ where: { userId, categoryId: id } });
}

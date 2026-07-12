import { apiClient } from './apiClient';
import { Category, CategoryType } from '@/types/category.types';

export async function fetchCategories(type?: CategoryType) {
  const res = await apiClient.get<{ data: Category[] }>('/api/categories', {
    params: type ? { type } : undefined,
  });
  return res.data.data;
}

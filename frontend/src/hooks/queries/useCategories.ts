import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services/categoriesApi';
import { CategoryType } from '@/types/category.types';

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type ?? 'all'],
    queryFn: () => fetchCategories(type),
  });
}

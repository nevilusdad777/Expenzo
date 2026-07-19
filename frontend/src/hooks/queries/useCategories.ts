import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services/categoriesApi';
import { CategoryType } from '@/types/category.types';

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type ?? 'all'],
    queryFn: () => fetchCategories(type),
    staleTime: 1000 * 60 * 10, // 10 minutes — categories rarely change
    gcTime: 1000 * 60 * 30,    // 30 minutes in memory
  });
}

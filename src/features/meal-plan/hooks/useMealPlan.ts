import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import { deleteMealPlan, fetchMealPlansForDate, fetchMealPlansForRange, saveMealPlan } from '../api';
import type { TablesInsert } from '../../../shared/types/database';

export function useMealPlansForDate(dateISO: string) {
  return useQuery({
    queryKey: queryKeys.mealPlansForDate(dateISO),
    queryFn: () => fetchMealPlansForDate(dateISO),
  });
}

export function useMealPlansForRange(fromISO: string, toISO: string) {
  return useQuery({
    queryKey: queryKeys.mealPlansForRange(fromISO, toISO),
    queryFn: () => fetchMealPlansForRange(fromISO, toISO),
  });
}

export function useSaveMealPlan(dateISO: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TablesInsert<'meal_plans'>) => saveMealPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlansForDate(dateISO) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayMeals });
    },
  });
}

export function useDeleteMealPlan(dateISO: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlansForDate(dateISO) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayMeals });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import { deleteRecipe, fetchRecipes, insertRecipe, setRecipeFavorite, updateRecipe } from '../api';
import type { TablesInsert, TablesUpdate } from '../../../shared/types/database';

export function useRecipes() {
  return useQuery({ queryKey: queryKeys.recipes, queryFn: fetchRecipes });
}

export function useAddRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TablesInsert<'recipes'>) => insertRecipe(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recipes }),
  });
}

export function useToggleFavoriteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      setRecipeFavorite(id, isFavorite),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recipes }),
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recipes }),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'recipes'> }) =>
      updateRecipe(params.id, params.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.recipes }),
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import type { TablesUpdate } from '../../../shared/types/database';
import {
  addTravelChecklistItem,
  addTravelChecklistItems,
  addTravelPlan,
  addWishlistPlace,
  deleteTravelChecklistItem,
  deleteTravelPlan,
  deleteWishlistPlace,
  fetchTravelChecklist,
  fetchTravelPlans,
  fetchTravelWishlist,
  toggleTravelChecklistItem,
  updateTravelChecklistItemTitle,
  updateTravelPlan,
  updateWishlistPlace,
} from '../api';

export function useTravelPlans() {
  return useQuery({ queryKey: queryKeys.travelPlans, queryFn: fetchTravelPlans });
}

export function useAddTravelPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; destination: string; plannedDate: string | null; budget: number | null }) =>
      addTravelPlan(params.userId, params.destination, params.plannedDate, params.budget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelPlans }),
  });
}

export function useUpdateTravelPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'travel_plans'> }) =>
      updateTravelPlan(params.id, params.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelPlans }),
  });
}

export function useDeleteTravelPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTravelPlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelPlans }),
  });
}

export function useTravelWishlist() {
  return useQuery({ queryKey: queryKeys.travelWishlist, queryFn: fetchTravelWishlist });
}

export function useAddWishlistPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; placeName: string; notes: string | null }) =>
      addWishlistPlace(params.userId, params.placeName, params.notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelWishlist }),
  });
}

export function useUpdateWishlistPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'travel_wishlist'> }) =>
      updateWishlistPlace(params.id, params.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelWishlist }),
  });
}

export function useDeleteWishlistPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWishlistPlace(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelWishlist }),
  });
}

export function useTravelChecklist(travelPlanId: string) {
  return useQuery({
    queryKey: queryKeys.travelChecklist(travelPlanId),
    queryFn: () => fetchTravelChecklist(travelPlanId),
    enabled: Boolean(travelPlanId),
  });
}

export function useAddTravelChecklistItem(travelPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; title: string }) =>
      addTravelChecklistItem(params.userId, travelPlanId, params.title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelChecklist(travelPlanId) }),
  });
}

export function useAddTravelChecklistItems(travelPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; titles: string[] }) =>
      addTravelChecklistItems(params.userId, travelPlanId, params.titles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelChecklist(travelPlanId) }),
  });
}

export function useToggleTravelChecklistItem(travelPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; isDone: boolean }) =>
      toggleTravelChecklistItem(params.id, params.isDone),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelChecklist(travelPlanId) }),
  });
}

export function useUpdateTravelChecklistItemTitle(travelPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; title: string }) =>
      updateTravelChecklistItemTitle(params.id, params.title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelChecklist(travelPlanId) }),
  });
}

export function useDeleteTravelChecklistItem(travelPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTravelChecklistItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.travelChecklist(travelPlanId) }),
  });
}

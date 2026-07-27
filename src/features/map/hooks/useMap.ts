import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import {
  deleteSavedPlace,
  fetchAllLocations,
  fetchSavedPlaces,
  insertSavedPlace,
  setLocationSharing,
  updateSavedPlace,
  upsertLocation,
} from '../api';
import type { TablesInsert, TablesUpdate } from '../../../shared/types/database';

export function useAllLocations() {
  return useQuery({ queryKey: queryKeys.locations, queryFn: fetchAllLocations });
}

export function useUpsertLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { profileId: string; latitude: number; longitude: number; speedMps: number | null }) =>
      upsertLocation(params.profileId, params.latitude, params.longitude, params.speedMps),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.locations }),
  });
}

export function useSetLocationSharing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { profileId: string; isSharing: boolean }) =>
      setLocationSharing(params.profileId, params.isSharing),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.locations }),
  });
}

export function useSavedPlaces() {
  return useQuery({ queryKey: queryKeys.savedPlaces, queryFn: fetchSavedPlaces });
}

export function useAddSavedPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (place: TablesInsert<'saved_places'>) => insertSavedPlace(place),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces }),
  });
}

export function useUpdateSavedPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'saved_places'> }) =>
      updateSavedPlace(params.id, params.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces }),
  });
}

export function useDeleteSavedPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSavedPlace(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces }),
  });
}

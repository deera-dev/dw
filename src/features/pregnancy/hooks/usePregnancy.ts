import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import type { TablesUpdate } from '../../../shared/types/database';
import {
  addPregnancyChecklistItem,
  addPregnancyChecklistItems,
  addPregnancyContact,
  deleteChecklistItem,
  deletePregnancyContact,
  fetchPregnancyChecklist,
  fetchPregnancyContacts,
  fetchPregnancyProfile,
  toggleChecklistItem,
  updateChecklistItemTitle,
  updatePregnancyContact,
  upsertPregnancyProfile,
} from '../api';

export function usePregnancyProfile() {
  return useQuery({ queryKey: queryKeys.pregnancyProfile, queryFn: fetchPregnancyProfile });
}

export function useSavePregnancyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      userId: string;
      existingId: string | null;
      patch: TablesUpdate<'pregnancy_profile'>;
    }) => upsertPregnancyProfile(params.userId, params.existingId, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyProfile });
    },
  });
}

export function usePregnancyChecklist() {
  return useQuery({ queryKey: queryKeys.pregnancyChecklist, queryFn: fetchPregnancyChecklist });
}

export function useAddChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; title: string }) =>
      addPregnancyChecklistItem(params.userId, params.title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyChecklist }),
  });
}

export function useAddChecklistItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; titles: string[] }) =>
      addPregnancyChecklistItems(params.userId, params.titles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyChecklist }),
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; isDone: boolean }) =>
      toggleChecklistItem(params.id, params.isDone),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyChecklist }),
  });
}

export function useUpdateChecklistItemTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; title: string }) => updateChecklistItemTitle(params.id, params.title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyChecklist }),
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChecklistItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyChecklist }),
  });
}

export function usePregnancyContacts() {
  return useQuery({ queryKey: queryKeys.pregnancyContacts, queryFn: fetchPregnancyContacts });
}

export function useAddPregnancyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; name: string; phone: string; role: string | null }) =>
      addPregnancyContact(params.userId, params.name, params.phone, params.role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyContacts }),
  });
}

export function useUpdatePregnancyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: { name?: string; phone?: string; role?: string | null } }) =>
      updatePregnancyContact(params.id, params.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyContacts }),
  });
}

export function useDeletePregnancyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePregnancyContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyContacts }),
  });
}

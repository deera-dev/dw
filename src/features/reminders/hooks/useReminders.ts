import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import {
  deactivateReminder,
  fetchAllReminders,
  fetchUpcomingReminders,
  insertReminder,
  updateReminder,
} from '../api';
import type { TablesInsert, TablesUpdate } from '../../../shared/types/database';

export function useAllReminders() {
  return useQuery({ queryKey: queryKeys.allReminders, queryFn: fetchAllReminders });
}

export function useUpcomingReminders(days = 7) {
  // Dibungkus useMemo & dibulatkan ke hari — kalau dihitung ulang tiap render
  // pakai `new Date()` mentah, queryKey berubah tiap milidetik dan bikin
  // React Query fetch tanpa henti (dikira query baru terus).
  const { fromISO, toISO } = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + days);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, [days]);

  return useQuery({
    queryKey: queryKeys.upcomingReminders(fromISO, toISO),
    queryFn: () => fetchUpcomingReminders(fromISO, toISO),
  });
}

export function useRemindersInRange(fromISO: string, toISO: string, enabled = true) {
  // Dipakai kalender visual (mode bulanan/mingguan/harian) — beda dari
  // useUpcomingReminders karena rentangnya bebas (bisa mencakup tanggal yang
  // sudah lewat), bukan selalu "dari hari ini". `enabled` dipakai supaya mode
  // yang sedang tidak aktif tidak ikut fetch.
  return useQuery({
    queryKey: queryKeys.upcomingReminders(fromISO, toISO),
    queryFn: () => fetchUpcomingReminders(fromISO, toISO),
    enabled,
  });
}

function invalidateReminderQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.allReminders });
  queryClient.invalidateQueries({ queryKey: queryKeys.todayReminders });
}

export function useAddReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TablesInsert<'reminders'>) => insertReminder(input),
    onSuccess: () => invalidateReminderQueries(queryClient),
  });
}

export function useDeactivateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateReminder(id),
    onSuccess: () => invalidateReminderQueries(queryClient),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'reminders'> }) =>
      updateReminder(params.id, params.patch),
    onSuccess: () => {
      invalidateReminderQueries(queryClient);
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'upcomingReminders' });
    },
  });
}

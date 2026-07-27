import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../../app/queryClient';

// Supaya perubahan yang dibuat Denny langsung muncul di HP Wulan (dan sebaliknya)
// tanpa perlu refresh manual — sesuai prinsip PRD "semua data terlihat berdua".
// Cukup satu channel Realtime yang dengar 4 tabel yang dipakai bersama, lalu
// invalidate query React Query yang relevan supaya data ke-refetch otomatis.
// `enabled` dikontrol dari luar (baru subscribe kalau sudah login) karena
// tabel-tabel ini hanya bisa dibaca oleh role authenticated.
export function useRealtimeSync(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('dw-shared-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
        queryClient.invalidateQueries({ queryKey: queryKeys.monthlySummary });
        queryClient.invalidateQueries({ queryKey: queryKeys.balance });
        queryClient.invalidateQueries({ queryKey: queryKeys.currentMonthExpense });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allReminders });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayReminders });
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'upcomingReminders' });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.todayMeals });
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'mealPlans' });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weight_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.weightRecentAll });
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'weightHistory' });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.waterToday });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exercise_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.exerciseThisWeek });
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'exerciseHistory' });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pregnancy_profile' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyProfile });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pregnancy_checklist_items' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyChecklist });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pregnancy_emergency_contacts' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.pregnancyContacts });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_pressure_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureRecentAll });
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'bloodPressureHistory' });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'travel_plans' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.travelPlans });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'travel_wishlist' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.travelWishlist });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'travel_checklist_items' }, () => {
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'travelChecklist' });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_places' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activityLog });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

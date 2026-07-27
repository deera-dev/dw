import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import {
  addWaterGlass,
  deleteBloodPressureLog,
  deleteExerciseLog,
  deleteSmokingLog,
  deleteWaterLog,
  deleteWeightLog,
  fetchBloodPressureHistory,
  fetchExerciseDatesForStreak,
  fetchExerciseLogs,
  fetchFirstExerciseLogDate,
  fetchRecentBloodPressureAllProfiles,
  fetchRecentSmokingAllProfiles,
  fetchRecentWeightLogsAllProfiles,
  fetchSmokingHistory,
  fetchThisWeekExerciseAllProfiles,
  fetchTodaySmokingAllProfiles,
  fetchTodayWaterLogsAllProfiles,
  fetchWeightHistory,
  insertBloodPressureLog,
  insertExerciseLog,
  insertSmokingLog,
  insertWeightLog,
  updateBloodPressureLog,
  updateExerciseLog,
  updateHeight,
  updateSmokingLog,
  updateWeightLog,
} from '../api';
import type { TablesUpdate } from '../../../shared/types/database';

export function useRecentWeightLogsAllProfiles() {
  return useQuery({
    queryKey: queryKeys.weightRecentAll,
    queryFn: () => fetchRecentWeightLogsAllProfiles(),
  });
}

export function useWeightHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weightHistory(userId ?? ''),
    queryFn: () => fetchWeightHistory(userId as string),
    enabled: Boolean(userId),
  });
}

export function useAddWeightLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weightKg: number) => insertWeightLog(userId as string, weightKg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weightHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.weightRecentAll });
    },
  });
}

export function useDeleteWeightLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWeightLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weightHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.weightRecentAll });
    },
  });
}

export function useUpdateWeightLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'weight_logs'> }) =>
      updateWeightLog(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weightHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.weightRecentAll });
    },
  });
}

export function useUpdateHeight(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (heightCm: number) => updateHeight(userId as string, heightCm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles });
    },
  });
}

// ---- Hidrasi ----

export function useTodayWaterAllProfiles() {
  return useQuery({ queryKey: queryKeys.waterToday, queryFn: fetchTodayWaterLogsAllProfiles });
}

export function useAddWaterGlass(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number = 1) => addWaterGlass(userId as string, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.waterToday }),
  });
}

export function useDeleteWaterLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWaterLog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.waterToday }),
  });
}

// ---- Olahraga ----

export function useExerciseHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exerciseHistory(userId ?? ''),
    queryFn: () => fetchExerciseLogs(userId as string),
    enabled: Boolean(userId),
  });
}

export function useThisWeekExerciseAllProfiles() {
  return useQuery({ queryKey: queryKeys.exerciseThisWeek, queryFn: fetchThisWeekExerciseAllProfiles });
}

// Dipakai untuk menghitung fase progresi (lihat exerciseProgram.ts) — tanggal
// log olahraga paling awal jadi patokan "sudah berapa lama ikut program",
// tanpa perlu kolom baru di DB.
export function useFirstExerciseLogDate(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.firstExerciseLogDate(userId ?? ''),
    queryFn: () => fetchFirstExerciseLogDate(userId as string),
    enabled: Boolean(userId),
  });
}

// Dipakai untuk lencana "X hari beruntun" checklist olahraga (lihat streak.ts).
export function useExerciseStreakDates(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exerciseStreakDates(userId ?? ''),
    queryFn: () => fetchExerciseDatesForStreak(userId as string),
    enabled: Boolean(userId),
  });
}

export function useAddExerciseLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activity, durationMinutes }: { activity: string; durationMinutes: number }) =>
      insertExerciseLog(userId as string, activity, durationMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseThisWeek });
      queryClient.invalidateQueries({ queryKey: queryKeys.firstExerciseLogDate(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseStreakDates(userId ?? '') });
    },
  });
}

export function useDeleteExerciseLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExerciseLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseThisWeek });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseStreakDates(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.firstExerciseLogDate(userId ?? '') });
    },
  });
}

export function useUpdateExerciseLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'exercise_logs'> }) =>
      updateExerciseLog(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseThisWeek });
    },
  });
}

// ---- Tensi Darah ----

export function useRecentBloodPressureAllProfiles() {
  return useQuery({
    queryKey: queryKeys.bloodPressureRecentAll,
    queryFn: () => fetchRecentBloodPressureAllProfiles(),
  });
}

export function useBloodPressureHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bloodPressureHistory(userId ?? ''),
    queryFn: () => fetchBloodPressureHistory(userId as string),
    enabled: Boolean(userId),
  });
}

export function useAddBloodPressureLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { systolic: number; diastolic: number; pulse: number | null }) =>
      insertBloodPressureLog(userId as string, params.systolic, params.diastolic, params.pulse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureRecentAll });
    },
  });
}

export function useDeleteBloodPressureLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBloodPressureLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureRecentAll });
    },
  });
}

export function useUpdateBloodPressureLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'blood_pressure_logs'> }) =>
      updateBloodPressureLog(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureHistory(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.bloodPressureRecentAll });
    },
  });
}

// ---- Rokok ----

export function useTodaySmokingAllProfiles() {
  return useQuery({ queryKey: queryKeys.smokingToday, queryFn: fetchTodaySmokingAllProfiles });
}

export function useRecentSmokingAllProfiles() {
  return useQuery({ queryKey: queryKeys.smokingRecentAll, queryFn: () => fetchRecentSmokingAllProfiles() });
}

export function useSmokingHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.smokingHistory(userId ?? ''),
    queryFn: () => fetchSmokingHistory(userId as string),
    enabled: Boolean(userId),
  });
}

export function useAddSmokingLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cigaretteCount: number = 1) => insertSmokingLog(userId as string, cigaretteCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingToday });
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingRecentAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingHistory(userId ?? '') });
    },
  });
}

export function useDeleteSmokingLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSmokingLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingToday });
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingRecentAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingHistory(userId ?? '') });
    },
  });
}

export function useUpdateSmokingLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'smoking_logs'> }) =>
      updateSmokingLog(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingToday });
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingRecentAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.smokingHistory(userId ?? '') });
    },
  });
}

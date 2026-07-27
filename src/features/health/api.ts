import { supabase } from '../../shared/lib/supabase';
import type { TablesUpdate } from '../../shared/types/database';

// Dipakai untuk kartu "berat terkini" Denny & Wulan sekaligus di satu layar —
// cukup ambil beberapa entri terbaru gabungan (2 orang, jarang input tiap hari).
export async function fetchRecentWeightLogsAllProfiles(limit = 40) {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchWeightHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('created_by', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function insertWeightLog(userId: string, weightKg: number) {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({ created_by: userId, weight_kg: weightKg })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWeightLog(id: string) {
  const { error } = await supabase.from('weight_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function updateWeightLog(id: string, patch: TablesUpdate<'weight_logs'>) {
  const { error } = await supabase.from('weight_logs').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateHeight(userId: string, heightCm: number) {
  const { error } = await supabase.from('profiles').update({ height_cm: heightCm }).eq('id', userId);
  if (error) throw error;
}

// ---- Hidrasi ----

export async function fetchTodayWaterLogsAllProfiles() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .gte('recorded_at', start.toISOString())
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addWaterGlass(userId: string, amount = 1) {
  const { error } = await supabase.from('water_logs').insert({ created_by: userId, amount_glasses: amount });
  if (error) throw error;
}

export async function deleteWaterLog(id: string) {
  const { error } = await supabase.from('water_logs').delete().eq('id', id);
  if (error) throw error;
}

// ---- Olahraga ----

export async function fetchExerciseLogs(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('created_by', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Cuma ambil kolom tanggal (bukan semua kolom) buat hitung "streak" hari
// beruntun checklist olahraga tercatat — dibatasi 60 hari terakhir, lebih dari
// cukup buat streak wajar tanpa perlu ambil seluruh histori.
export async function fetchExerciseDatesForStreak(userId: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('recorded_at')
    .eq('created_by', userId)
    .gte('recorded_at', cutoff.toISOString())
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => r.recorded_at);
}

export async function fetchThisWeekExerciseAllProfiles() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(monday.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .gte('recorded_at', monday.toISOString())
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertExerciseLog(userId: string, activity: string, durationMinutes: number) {
  const { error } = await supabase
    .from('exercise_logs')
    .insert({ created_by: userId, activity, duration_minutes: durationMinutes });
  if (error) throw error;
}

// Dipakai untuk menentukan "sudah berapa lama ikut program olahraga" TANPA
// kolom baru di DB — cukup ambil tanggal exercise_logs paling awal milik user
// (lihat exerciseProgram.ts: getWeeksSinceStart/getProgressionPhase). Null
// artinya user itu belum pernah mencentang apa pun (masih Fase 1/Fondasi).
export async function fetchFirstExerciseLogDate(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('recorded_at')
    .eq('created_by', userId)
    .order('recorded_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.recorded_at ?? null;
}

export async function deleteExerciseLog(id: string) {
  const { error } = await supabase.from('exercise_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function updateExerciseLog(id: string, patch: TablesUpdate<'exercise_logs'>) {
  const { error } = await supabase.from('exercise_logs').update(patch).eq('id', id);
  if (error) throw error;
}

// ---- Tensi Darah ----

export async function fetchRecentBloodPressureAllProfiles(limit = 40) {
  const { data, error } = await supabase
    .from('blood_pressure_logs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchBloodPressureHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('blood_pressure_logs')
    .select('*')
    .eq('created_by', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function insertBloodPressureLog(
  userId: string,
  systolic: number,
  diastolic: number,
  pulse: number | null
) {
  const { error } = await supabase
    .from('blood_pressure_logs')
    .insert({ created_by: userId, systolic, diastolic, pulse });
  if (error) throw error;
}

export async function deleteBloodPressureLog(id: string) {
  const { error } = await supabase.from('blood_pressure_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function updateBloodPressureLog(id: string, patch: TablesUpdate<'blood_pressure_logs'>) {
  const { error } = await supabase.from('blood_pressure_logs').update(patch).eq('id', id);
  if (error) throw error;
}

// ---- Rokok ----

export async function fetchTodaySmokingAllProfiles() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('smoking_logs')
    .select('*')
    .gte('recorded_at', start.toISOString())
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRecentSmokingAllProfiles(limit = 60) {
  const { data, error } = await supabase
    .from('smoking_logs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchSmokingHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('smoking_logs')
    .select('*')
    .eq('created_by', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function insertSmokingLog(userId: string, cigaretteCount = 1) {
  const { error } = await supabase
    .from('smoking_logs')
    .insert({ created_by: userId, cigarette_count: cigaretteCount });
  if (error) throw error;
}

export async function deleteSmokingLog(id: string) {
  const { error } = await supabase.from('smoking_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function updateSmokingLog(id: string, patch: TablesUpdate<'smoking_logs'>) {
  const { error } = await supabase.from('smoking_logs').update(patch).eq('id', id);
  if (error) throw error;
}

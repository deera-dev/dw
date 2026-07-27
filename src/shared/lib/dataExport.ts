import { Share } from 'react-native';
import { supabase } from './supabase';

// Ekspor sederhana: tarik data utama dari tabel yang dipakai berdua, gabung
// jadi satu JSON, lalu pakai Share API bawaan RN (tanpa dependency baru) biar
// user bisa simpan/kirim sendiri lewat aplikasi apa pun yang ada di HP-nya.
export async function exportAllDataAsJson() {
  const tables = [
    'profiles',
    'accounts',
    'transactions',
    'reminders',
    'meal_plans',
    'recipes',
    'weight_logs',
    'water_logs',
    'exercise_logs',
    'blood_pressure_logs',
    'smoking_logs',
    'pregnancy_profile',
    'pregnancy_checklist_items',
    'pregnancy_emergency_contacts',
    'travel_plans',
    'travel_wishlist',
    'travel_checklist_items',
  ] as const;

  const result: Record<string, unknown> = { exported_at: new Date().toISOString() };

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    result[table] = data;
  }

  const json = JSON.stringify(result, null, 2);
  await Share.share({
    title: 'Ekspor Data DW',
    message: json,
  });
}

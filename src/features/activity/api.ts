import { supabase } from '../../shared/lib/supabase';

const PAGE_SIZE = 50;

// Diisi otomatis lewat trigger DB (activity_log_trigger) di ~16 tabel — lihat
// migrasi add_activity_log. Fitur ini cuma baca, tidak pernah menulis manual.
export async function fetchActivityLog(limit = PAGE_SIZE) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

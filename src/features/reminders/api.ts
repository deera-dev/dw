import { supabase } from '../../shared/lib/supabase';
import type { TablesInsert, TablesUpdate } from '../../shared/types/database';

export async function fetchAllReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_active', true)
    .order('start_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertReminder(input: TablesInsert<'reminders'>) {
  const { data, error } = await supabase.from('reminders').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deactivateReminder(id: string) {
  const { error } = await supabase.from('reminders').update({ is_active: false }).eq('id', id);
  if (error) throw error;
}

export async function updateReminder(id: string, patch: TablesUpdate<'reminders'>) {
  const { data, error } = await supabase.from('reminders').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function fetchUpcomingReminders(fromISO?: string, toISO?: string) {
  const { data, error } = await supabase.rpc('f_upcoming_reminders', {
    p_from: fromISO,
    p_to: toISO,
  });
  if (error) throw error;
  return data;
}

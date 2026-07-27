import { supabase } from '../../shared/lib/supabase';
import type { TablesUpdate } from '../../shared/types/database';

// Singleton settings — hanya boleh ada 1 baris untuk sepasang (Denny & Wulan).
export async function fetchPregnancyProfile() {
  const { data, error } = await supabase
    .from('pregnancy_profile')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertPregnancyProfile(
  userId: string,
  existingId: string | null,
  patch: TablesUpdate<'pregnancy_profile'>
) {
  if (existingId) {
    const { data, error } = await supabase
      .from('pregnancy_profile')
      .update({ ...patch, updated_by: userId, updated_at: new Date().toISOString() })
      .eq('id', existingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('pregnancy_profile')
    .insert({ ...patch, updated_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Checklist ----

export async function fetchPregnancyChecklist() {
  const { data, error } = await supabase
    .from('pregnancy_checklist_items')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addPregnancyChecklistItem(userId: string, title: string) {
  const { error } = await supabase
    .from('pregnancy_checklist_items')
    .insert({ created_by: userId, title });
  if (error) throw error;
}

export async function addPregnancyChecklistItems(userId: string, titles: string[]) {
  if (titles.length === 0) return;
  const { error } = await supabase
    .from('pregnancy_checklist_items')
    .insert(titles.map((title) => ({ created_by: userId, title })));
  if (error) throw error;
}

export async function toggleChecklistItem(id: string, isDone: boolean) {
  const { error } = await supabase
    .from('pregnancy_checklist_items')
    .update({ is_done: isDone })
    .eq('id', id);
  if (error) throw error;
}

export async function updateChecklistItemTitle(id: string, title: string) {
  const { error } = await supabase.from('pregnancy_checklist_items').update({ title }).eq('id', id);
  if (error) throw error;
}

export async function deleteChecklistItem(id: string) {
  const { error } = await supabase.from('pregnancy_checklist_items').delete().eq('id', id);
  if (error) throw error;
}

// ---- Kontak darurat ----

export async function fetchPregnancyContacts() {
  const { data, error } = await supabase
    .from('pregnancy_emergency_contacts')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addPregnancyContact(
  userId: string,
  name: string,
  phone: string,
  role: string | null
) {
  const { error } = await supabase
    .from('pregnancy_emergency_contacts')
    .insert({ created_by: userId, name, phone, role });
  if (error) throw error;
}

export async function deletePregnancyContact(id: string) {
  const { error } = await supabase.from('pregnancy_emergency_contacts').delete().eq('id', id);
  if (error) throw error;
}

export async function updatePregnancyContact(
  id: string,
  patch: { name?: string; phone?: string; role?: string | null }
) {
  const { error } = await supabase.from('pregnancy_emergency_contacts').update(patch).eq('id', id);
  if (error) throw error;
}

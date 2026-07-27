import { supabase } from '../../shared/lib/supabase';
import type { TablesInsert } from '../../shared/types/database';

export async function fetchMealPlansForDate(dateISO: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, recipes(name)')
    .eq('meal_date', dateISO);
  if (error) throw error;
  return data;
}

export async function fetchMealPlansForRange(fromISO: string, toISO: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .gte('meal_date', fromISO)
    .lte('meal_date', toISO);
  if (error) throw error;
  return data;
}

export async function saveMealPlan(input: TablesInsert<'meal_plans'>) {
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(input, { onConflict: 'meal_date,meal_type' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMealPlan(id: string) {
  const { error } = await supabase.from('meal_plans').delete().eq('id', id);
  if (error) throw error;
}

import { supabase } from '../../shared/lib/supabase';
import type { TablesInsert, TablesUpdate } from '../../shared/types/database';

export async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertRecipe(input: TablesInsert<'recipes'>) {
  const { data, error } = await supabase.from('recipes').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function setRecipeFavorite(id: string, isFavorite: boolean) {
  const { error } = await supabase.from('recipes').update({ is_favorite: isFavorite }).eq('id', id);
  if (error) throw error;
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

export async function updateRecipe(id: string, patch: TablesUpdate<'recipes'>) {
  const { data, error } = await supabase.from('recipes').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

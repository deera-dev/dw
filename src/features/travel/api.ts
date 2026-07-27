import { supabase } from '../../shared/lib/supabase';
import type { TablesUpdate } from '../../shared/types/database';

// ---- Rencana jalan-jalan ----

export async function fetchTravelPlans() {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .order('planned_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function addTravelPlan(
  userId: string,
  destination: string,
  plannedDate: string | null,
  budget: number | null
) {
  const { error } = await supabase
    .from('travel_plans')
    .insert({ created_by: userId, destination, planned_date: plannedDate, budget });
  if (error) throw error;
}

export async function updateTravelPlan(id: string, patch: TablesUpdate<'travel_plans'>) {
  const { error } = await supabase.from('travel_plans').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteTravelPlan(id: string) {
  const { error } = await supabase.from('travel_plans').delete().eq('id', id);
  if (error) throw error;
}

// ---- Wishlist ----

export async function fetchTravelWishlist() {
  const { data, error } = await supabase
    .from('travel_wishlist')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addWishlistPlace(userId: string, placeName: string, notes: string | null) {
  const { error } = await supabase
    .from('travel_wishlist')
    .insert({ created_by: userId, place_name: placeName, notes });
  if (error) throw error;
}

export async function deleteWishlistPlace(id: string) {
  const { error } = await supabase.from('travel_wishlist').delete().eq('id', id);
  if (error) throw error;
}

export async function updateWishlistPlace(id: string, patch: TablesUpdate<'travel_wishlist'>) {
  const { error } = await supabase.from('travel_wishlist').update(patch).eq('id', id);
  if (error) throw error;
}

// ---- Checklist per rencana ----

export async function fetchTravelChecklist(travelPlanId: string) {
  const { data, error } = await supabase
    .from('travel_checklist_items')
    .select('*')
    .eq('travel_plan_id', travelPlanId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addTravelChecklistItem(userId: string, travelPlanId: string, title: string) {
  const { error } = await supabase
    .from('travel_checklist_items')
    .insert({ created_by: userId, travel_plan_id: travelPlanId, title });
  if (error) throw error;
}

export async function addTravelChecklistItems(userId: string, travelPlanId: string, titles: string[]) {
  if (titles.length === 0) return;
  const { error } = await supabase
    .from('travel_checklist_items')
    .insert(titles.map((title) => ({ created_by: userId, travel_plan_id: travelPlanId, title })));
  if (error) throw error;
}

export async function toggleTravelChecklistItem(id: string, isDone: boolean) {
  const { error } = await supabase.from('travel_checklist_items').update({ is_done: isDone }).eq('id', id);
  if (error) throw error;
}

export async function deleteTravelChecklistItem(id: string) {
  const { error } = await supabase.from('travel_checklist_items').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTravelChecklistItemTitle(id: string, title: string) {
  const { error } = await supabase.from('travel_checklist_items').update({ title }).eq('id', id);
  if (error) throw error;
}

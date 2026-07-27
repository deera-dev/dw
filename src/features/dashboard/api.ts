import { supabase } from '../../shared/lib/supabase';

// File ini sengaja "bodoh": tidak ada kalkulasi, hanya panggilan ke
// view/RPC Supabase yang sudah punya hasil jadi.

export async function fetchCurrentBalance() {
  const { data, error } = await supabase.from('v_current_balance').select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchCurrentMonthExpense() {
  const { data, error } = await supabase.from('v_current_month_expense').select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchTodayMeals() {
  const { data, error } = await supabase.from('v_today_meals').select('*');
  if (error) throw error;
  return data;
}

export async function fetchTodayReminders() {
  const { data, error } = await supabase.rpc('f_today_reminders');
  if (error) throw error;
  return data;
}

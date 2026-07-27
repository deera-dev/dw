import { supabase } from '../../shared/lib/supabase';
import type { TablesInsert, TablesUpdate } from '../../shared/types/database';

export async function fetchTransactions(limit = 50) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Tanpa limit — dipakai untuk hitung saldo akun & arus kas bulanan, yang
// butuh SEMUA transaksi (bukan cuma 50 terbaru). Aplikasi 2 orang, volume
// data masih kecil, jadi aman diambil utuh dan dihitung di client.
export async function fetchAllTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAccounts() {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertAccount(input: TablesInsert<'accounts'>) {
  const { data, error } = await supabase.from('accounts').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateAccount(id: string, patch: TablesUpdate<'accounts'>) {
  const { data, error } = await supabase.from('accounts').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function removeAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
}

// Dicek sebelum hapus akun — kalau masih ada transaksi yang menunjuk ke akun
// ini, tolak penghapusan (lebih aman daripada diam-diam melepas account_id
// jadi null di transaksi lama; user harus pindahkan/hapus transaksinya dulu).
export async function countTransactionsForAccount(accountId: string) {
  const { count, error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchMonthlySummary() {
  const { data, error } = await supabase
    .from('v_monthly_summary')
    .select('*')
    .order('month', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertTransaction(input: TablesInsert<'transactions'>) {
  const { data, error } = await supabase.from('transactions').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function removeTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTransaction(id: string, patch: TablesUpdate<'transactions'>) {
  const { data, error } = await supabase.from('transactions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

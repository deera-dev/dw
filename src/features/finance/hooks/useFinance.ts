import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/queryClient';
import {
  fetchAccounts,
  fetchAllTransactions,
  fetchMonthlySummary,
  fetchTransactions,
  insertAccount,
  insertTransaction,
  removeAccount,
  removeTransaction,
  updateAccount,
  updateTransaction,
} from '../api';
import { computeCurrentMonthCashFlow, computeTotalWealth } from '../lib/accountBalance';
import type { TablesInsert, TablesUpdate } from '../../../shared/types/database';

export function useTransactions() {
  return useQuery({ queryKey: queryKeys.transactions, queryFn: () => fetchTransactions() });
}

// Semua transaksi tanpa limit — dipakai untuk hitung saldo per akun & arus
// kas bulan ini, yang butuh data utuh bukan cuma 50 transaksi terbaru.
export function useAllTransactions() {
  return useQuery({ queryKey: queryKeys.allTransactions, queryFn: fetchAllTransactions });
}

export function useMonthlySummary() {
  return useQuery({ queryKey: queryKeys.monthlySummary, queryFn: fetchMonthlySummary });
}

export function useAccounts() {
  return useQuery({ queryKey: queryKeys.accounts, queryFn: fetchAccounts });
}

// "Sisa gaji bulan ini" (arus kas bulan berjalan) & "total kekayaan" (saldo
// semua akun digabung) — dua angka yang sengaja dipisah biar tidak tertukar
// maknanya. Dihitung di client dari data akun + transaksi lengkap.
export function useFinanceOverview() {
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: transactions = [], isLoading: loadingTransactions } = useAllTransactions();

  const totalWealth = computeTotalWealth(accounts, transactions);
  const cashFlow = computeCurrentMonthCashFlow(transactions);

  return {
    isLoading: loadingAccounts || loadingTransactions,
    totalWealth,
    sisaGajiBulanIni: cashFlow.net,
    incomeThisMonth: cashFlow.income,
    expenseThisMonth: cashFlow.expense,
  };
}

function invalidateFinance(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
  queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions });
  queryClient.invalidateQueries({ queryKey: queryKeys.monthlySummary });
  queryClient.invalidateQueries({ queryKey: queryKeys.balance });
  queryClient.invalidateQueries({ queryKey: queryKeys.currentMonthExpense });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TablesInsert<'transactions'>) => insertTransaction(input),
    onSuccess: () => {
      // Invalidate query yang kena dampak transaksi baru — biar Dasbor & daftar ikut update.
      invalidateFinance(queryClient);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeTransaction(id),
    onSuccess: () => {
      invalidateFinance(queryClient);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'transactions'> }) =>
      updateTransaction(params.id, params.patch),
    onSuccess: () => {
      invalidateFinance(queryClient);
    },
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TablesInsert<'accounts'>) => insertAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      invalidateFinance(queryClient);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patch: TablesUpdate<'accounts'> }) =>
      updateAccount(params.id, params.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      invalidateFinance(queryClient);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      invalidateFinance(queryClient);
    },
  });
}

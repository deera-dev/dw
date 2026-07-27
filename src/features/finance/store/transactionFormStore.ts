import { create } from 'zustand';
import type { Tables } from '../../../shared/types/database';

type Transaction = Tables<'transactions'>;

type TransactionFormState = {
  modalVisible: boolean;
  editingId: string | null;
  type: 'pemasukan' | 'pengeluaran';
  amount: string;
  category: string;
  description: string;
  accountId: string | null;
  openModal: () => void;
  openEditModal: (tx: Transaction) => void;
  closeModal: () => void;
  setType: (t: 'pemasukan' | 'pengeluaran') => void;
  setAmount: (v: string) => void;
  setCategory: (v: string) => void;
  setDescription: (v: string) => void;
  setAccountId: (v: string | null) => void;
  reset: () => void;
};

// Ini murni state form/UI (modal terbuka/tertutup, input yang sedang diketik) —
// bukan data bisnis. Data transaksi sesungguhnya tetap dari React Query/Supabase.
// `editingId` null berarti mode tambah baru; terisi berarti sedang mengedit
// transaksi yang sudah ada (dibuka lewat tap pada baris transaksi).
export const useTransactionFormStore = create<TransactionFormState>((set) => ({
  modalVisible: false,
  editingId: null,
  type: 'pengeluaran',
  amount: '',
  category: '',
  description: '',
  accountId: null,
  openModal: () => set({ modalVisible: true, editingId: null, accountId: null }),
  openEditModal: (tx) =>
    set({
      modalVisible: true,
      editingId: tx.id,
      type: tx.type as 'pemasukan' | 'pengeluaran',
      amount: String(tx.amount),
      category: tx.category,
      description: tx.description ?? '',
      accountId: tx.account_id ?? null,
    }),
  closeModal: () => set({ modalVisible: false }),
  setType: (type) => set({ type }),
  setAmount: (amount) => set({ amount }),
  setCategory: (category) => set({ category }),
  setDescription: (description) => set({ description }),
  setAccountId: (accountId) => set({ accountId }),
  reset: () =>
    set({
      amount: '',
      category: '',
      description: '',
      type: 'pengeluaran',
      editingId: null,
      accountId: null,
    }),
}));

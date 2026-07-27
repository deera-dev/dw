import { create } from 'zustand';
import type { Tables } from '../../../shared/types/database';
import type { AccountType } from '../lib/accountBalance';

type Account = Tables<'accounts'>;

type AccountFormState = {
  modalVisible: boolean;
  editingId: string | null;
  name: string;
  type: AccountType;
  initialBalance: string;
  openModal: () => void;
  openEditModal: (account: Account) => void;
  closeModal: () => void;
  setName: (v: string) => void;
  setType: (t: AccountType) => void;
  setInitialBalance: (v: string) => void;
  reset: () => void;
};

// Murni state form/UI untuk modal tambah/edit akun — sama polanya dengan
// transactionFormStore. `editingId` null berarti mode tambah baru.
export const useAccountFormStore = create<AccountFormState>((set) => ({
  modalVisible: false,
  editingId: null,
  name: '',
  type: 'bank',
  initialBalance: '',
  openModal: () => set({ modalVisible: true, editingId: null }),
  openEditModal: (account) =>
    set({
      modalVisible: true,
      editingId: account.id,
      name: account.name,
      type: account.type as AccountType,
      initialBalance: String(account.initial_balance),
    }),
  closeModal: () => set({ modalVisible: false }),
  setName: (name) => set({ name }),
  setType: (type) => set({ type }),
  setInitialBalance: (initialBalance) => set({ initialBalance }),
  reset: () => set({ name: '', type: 'bank', initialBalance: '', editingId: null }),
}));

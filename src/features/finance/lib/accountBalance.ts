import type { Ionicons } from '@expo/vector-icons';
import type { Tables } from '../../../shared/types/database';

export type Account = Tables<'accounts'>;
export type Transaction = Tables<'transactions'>;

// `type` di database cuma text + check constraint (bukan enum Postgres), jadi
// di generated types tampil sebagai `string`. Union ini yang jadi acuan di
// sisi app supaya tetap type-safe dan konsisten dengan constraint di DB.
export type AccountType = 'bank' | 'tabungan' | 'saham' | 'cash' | 'lainnya';

export const ACCOUNT_TYPE_OPTIONS: AccountType[] = ['bank', 'tabungan', 'saham', 'cash', 'lainnya'];

// Label rapi untuk ditampilkan ke user — nilai di DB tetap kode singkat
// (bank, tabungan, saham, cash, lainnya) supaya konsisten sebagai data.
export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  bank: 'Rekening Bank',
  tabungan: 'Tabungan',
  saham: 'Saham/Investasi',
  cash: 'Uang Tunai',
  lainnya: 'Lainnya',
};

export const ACCOUNT_TYPE_ICON: Record<AccountType, keyof typeof Ionicons.glyphMap> = {
  bank: 'business-outline',
  tabungan: 'wallet-outline',
  saham: 'trending-up-outline',
  cash: 'cash-outline',
  lainnya: 'ellipsis-horizontal-circle-outline',
};

// Saldo akun sengaja TIDAK disimpan sebagai angka berjalan di DB — supaya
// selalu konsisten dengan ledger transaksi tanpa perlu trigger. Saldo akun =
// initial_balance + semua pemasukan ke akun itu - semua pengeluaran dari akun
// itu. Untuk akun investasi (saham) yang nilainya naik/turun sendiri (bukan
// karena uang masuk/keluar), polanya: user mencatat transaksi pemasukan/
// pengeluaran biasa dengan kategori semacam "Penyesuaian Nilai Investasi".
export function computeAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.initial_balance;
  for (const tx of transactions) {
    if (tx.account_id !== account.id) continue;
    if (tx.type === 'pemasukan') balance += tx.amount;
    else if (tx.type === 'pengeluaran') balance -= tx.amount;
  }
  return balance;
}

export function computeTotalWealth(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((sum, acc) => sum + computeAccountBalance(acc, transactions), 0);
}

function isSameMonth(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// "Sisa gaji bulan ini" = arus kas bulan berjalan (pemasukan - pengeluaran),
// beda konsepnya dari total kekayaan (saldo seluruh akun digabung).
export function computeCurrentMonthCashFlow(transactions: Transaction[], now: Date = new Date()) {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (!isSameMonth(tx.transaction_date, now)) continue;
    if (tx.type === 'pemasukan') income += tx.amount;
    else if (tx.type === 'pengeluaran') expense += tx.amount;
  }
  return { income, expense, net: income - expense };
}

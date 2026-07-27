import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Tables } from '../../../shared/types/database';
import { useAccounts, useAllTransactions, useDeleteAccount } from '../hooks/useFinance';
import { useAccountFormStore } from '../store/accountFormStore';
import { computeAccountBalance, ACCOUNT_TYPE_LABEL, ACCOUNT_TYPE_ICON, type AccountType } from '../lib/accountBalance';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import { countTransactionsForAccount } from '../api';
import EmptyState from '../../../shared/ui/EmptyState';
import Fab from '../../../shared/ui/Fab';
import AddAccountModal from './AddAccountModal';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

type Account = Tables<'accounts'>;

function AccountRow({ account, balance }: { account: Account; balance: number }) {
  const deleteAccount = useDeleteAccount();
  const openEditModal = useAccountFormStore((s) => s.openEditModal);
  const type = account.type as AccountType;

  async function handleDelete() {
    // Keputusan desain: BLOKIR penghapusan kalau akun masih punya transaksi
    // terkait, daripada diam-diam melepas account_id transaksi lama jadi
    // null. Lebih aman & lebih mudah dipahami user ("pindahkan/hapus dulu
    // transaksinya") daripada riwayat transaksi tiba-tiba "kehilangan" akun.
    const count = await countTransactionsForAccount(account.id);
    if (count > 0) {
      showAlert(
        'Belum bisa dihapus',
        `Akun "${account.name}" masih punya ${count} transaksi. Hapus atau pindahkan transaksinya dulu sebelum menghapus akun ini.`
      );
      return;
    }
    confirmAction({
      title: 'Hapus akun?',
      message: `${account.name} (${ACCOUNT_TYPE_LABEL[type]})`,
      onConfirm: () => deleteAccount.mutate(account.id),
    });
  }

  return (
    <Pressable
      onPress={() => openEditModal(account)}
      className="mb-2.5 flex-row items-center justify-between rounded-xl bg-card p-3.5"
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
        <Ionicons name={ACCOUNT_TYPE_ICON[type]} size={18} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-ink">{account.name}</Text>
        <Text className="mt-0.5 text-xs text-muted">{ACCOUNT_TYPE_LABEL[type]}</Text>
        <Text className="mt-1 text-[10px] text-subtle">ketuk untuk edit</Text>
      </View>
      <View className="items-end">
        <Text className="text-[15px] font-bold text-ink">{formatRupiah(balance)}</Text>
      </View>
      <Pressable hitSlop={10} onPress={handleDelete} className="ml-3 p-1.5">
        <Ionicons name="trash-outline" size={16} color="#E5766D" />
      </Pressable>
    </Pressable>
  );
}

export default function AccountsSection() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: transactions = [] } = useAllTransactions();
  const openModal = useAccountFormStore((s) => s.openModal);

  const totalBalance = accounts.reduce((sum, acc) => sum + computeAccountBalance(acc, transactions), 0);

  return (
    <View className="flex-1">
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          accounts.length > 0 ? (
            <View className="mb-3 rounded-2xl bg-card p-4">
              <Text className="text-xs text-muted">Total saldo semua akun</Text>
              <Text className="mt-1 text-xl font-bold text-ink">{formatRupiah(totalBalance)}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <AccountRow account={item} balance={computeAccountBalance(item, transactions)} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="wallet-outline"
              text="Belum ada akun. Tambah akun (misal BCA, Tabungan, Cash) dulu supaya transaksi bisa dicatat per akun."
            />
          ) : null
        }
      />

      <Fab onPress={openModal} />

      <AddAccountModal />
    </View>
  );
}

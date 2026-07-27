import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Tables } from '../../../shared/types/database';
import { useAccounts, useDeleteTransaction } from '../hooks/useFinance';
import { useProfilesMap } from '../../../shared/hooks/useProfiles';
import { useTransactionFormStore } from '../store/transactionFormStore';
import { confirmAction } from '../../../shared/lib/confirm';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TransactionRow({ item }: { item: Tables<'transactions'> }) {
  const isIncome = item.type === 'pemasukan';
  const deleteTransaction = useDeleteTransaction();
  const profiles = useProfilesMap();
  const recordedByName = profiles[item.recorded_by] ?? '—';
  const openEditModal = useTransactionFormStore((s) => s.openEditModal);
  const { data: accounts = [] } = useAccounts();
  const accountName = accounts.find((a) => a.id === item.account_id)?.name;

  function handleDelete() {
    confirmAction({
      title: 'Hapus transaksi?',
      message: `${item.category} — ${formatRupiah(item.amount)}`,
      onConfirm: () => deleteTransaction.mutate(item.id),
    });
  }

  return (
    <Pressable
      onPress={() => openEditModal(item)}
      className="mb-2.5 flex-row items-center justify-between rounded-xl bg-card p-3.5"
    >
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-ink">{item.category}</Text>
        {item.description ? <Text className="mt-0.5 text-xs text-muted">{item.description}</Text> : null}
        <Text className="mt-1 text-[11px] text-subtle">
          {item.transaction_date} · dicatat {recordedByName}
          {accountName ? ` · ${accountName}` : ''}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`text-[15px] font-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
          {isIncome ? '+' : '-'}
          {formatRupiah(item.amount)}
        </Text>
        <Text className="mt-1 text-[10px] text-subtle">ketuk untuk edit</Text>
      </View>
      <Pressable hitSlop={10} onPress={handleDelete} className="ml-3 p-1.5">
        <Ionicons name="trash-outline" size={16} color="#E5766D" />
      </Pressable>
    </Pressable>
  );
}

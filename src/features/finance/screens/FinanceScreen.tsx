import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTransactions } from '../hooks/useFinance';
import { useTransactionFormStore } from '../store/transactionFormStore';
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../components/AddTransactionModal';
import MonthlySummary from '../components/MonthlySummary';
import AccountsSection from '../components/AccountsSection';
import BudgetSummaryCard from '../components/BudgetSummaryCard';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import Fab from '../../../shared/ui/Fab';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';
import FadeIn from '../../../shared/ui/FadeIn';

type Tab = 'transaksi' | 'ringkasan' | 'akun';

export default function FinanceScreen() {
  const { data: transactions = [] } = useTransactions();
  const openModal = useTransactionFormStore((s) => s.openModal);
  const [tab, setTab] = useState<Tab>('transaksi');

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="wallet" title="Keuangan" subtitle="Pemasukan & pengeluaran berdua" />
      </View>

      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        options={[
          { value: 'transaksi', label: 'Transaksi' },
          { value: 'ringkasan', label: 'Ringkasan' },
          { value: 'akun', label: 'Akun' },
        ]}
      />

      <FadeIn key={tab}>
        {tab === 'transaksi' ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={<BudgetSummaryCard />}
            renderItem={({ item }) => <TransactionRow item={item} />}
            ListEmptyComponent={<EmptyState icon="receipt-outline" text="Belum ada transaksi." />}
          />
        ) : tab === 'ringkasan' ? (
          <MonthlySummary />
        ) : (
          <AccountsSection />
        )}
      </FadeIn>

      {tab !== 'akun' && <Fab onPress={openModal} />}

      <AddTransactionModal />
    </View>
  );
}

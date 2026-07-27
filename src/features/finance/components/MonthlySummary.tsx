import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMonthlySummary } from '../hooks/useFinance';
import { useCurrentBalance, useCurrentMonthExpense } from '../../dashboard/hooks/useDashboard';
import { computeFinanceInsight } from '../lib/insights';
import FinanceInsightCard from './FinanceInsightCard';
import { useThemeVars } from '../../../shared/theme/useThemeVars';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatMonthLabel(month: string) {
  const d = new Date(month);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export default function MonthlySummary() {
  const { data = [], isLoading } = useMonthlySummary();
  const { data: balanceData } = useCurrentBalance();
  const { data: expenseData } = useCurrentMonthExpense();
  const [showInsight, setShowInsight] = useState(false);
  const { primary } = useThemeVars();

  const byMonth = new Map<string, typeof data>();
  data.forEach((row) => {
    const key = row.month ?? '';
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(row);
  });

  const months = [...byMonth.entries()];

  const insight = computeFinanceInsight({
    summary: data,
    currentBalance: balanceData?.balance ?? null,
    currentMonthExpense: expenseData?.total_pengeluaran_bulan_ini ?? null,
  });

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <Pressable
        className="mb-4 flex-row items-center justify-center gap-1.5 rounded-xl border border-primary p-3"
        onPress={() => setShowInsight((v) => !v)}
      >
        <Ionicons name="sparkles-outline" size={15} color={primary} />
        <Text className="text-sm font-semibold text-primary">
          {showInsight ? 'Sembunyikan Ringkasan' : 'Ringkas Bulan Ini'}
        </Text>
      </Pressable>

      {showInsight && <FinanceInsightCard insight={insight} />}

      {isLoading && <Text className="text-center text-subtle">Memuat...</Text>}

      {months.map(([month, rows]) => {
        const income = rows.filter((r) => r.type === 'pemasukan');
        const expense = rows.filter((r) => r.type === 'pengeluaran');
        const totalIncome = income.reduce((s, r) => s + (r.total ?? 0), 0);
        const totalExpense = expense.reduce((s, r) => s + (r.total ?? 0), 0);

        return (
          <View key={month} className="mb-4 rounded-2xl bg-card p-4">
            <Text className="mb-3 text-base font-bold capitalize text-ink">{formatMonthLabel(month)}</Text>

            <View className="mb-3 flex-row justify-between">
              <View>
                <Text className="text-xs text-muted">Pemasukan</Text>
                <Text className="text-base font-semibold text-success">{formatRupiah(totalIncome)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted">Pengeluaran</Text>
                <Text className="text-base font-semibold text-danger">{formatRupiah(totalExpense)}</Text>
              </View>
            </View>

            {expense.length > 0 && (
              <View className="mt-1 border-t border-border pt-2">
                <Text className="mb-1.5 text-xs font-semibold text-muted">Pengeluaran per kategori</Text>
                {expense.map((r) => (
                  <View key={`${month}-${r.category}`} className="flex-row justify-between py-1">
                    <Text className="text-sm text-ink">
                      {r.category} ({r.jumlah_transaksi}x)
                    </Text>
                    <Text className="text-sm font-medium text-ink">{formatRupiah(r.total ?? 0)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {!isLoading && months.length === 0 && (
        <Text className="mt-10 text-center text-subtle">Belum ada data transaksi.</Text>
      )}
    </ScrollView>
  );
}

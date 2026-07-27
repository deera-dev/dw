import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  useCurrentBalance,
  useCurrentMonthExpense,
  useTodayMeals,
  useTodayReminders,
} from '../hooks/useDashboard';
import { queryKeys } from '../../../app/queryClient';
import Card from '../../../shared/ui/Card';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import DashboardTrends from '../components/DashboardTrends';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const balanceQuery = useCurrentBalance();
  const expenseQuery = useCurrentMonthExpense();
  const mealsQuery = useTodayMeals();
  const remindersQuery = useTodayReminders();

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({
      predicate: (q) =>
        [queryKeys.balance, queryKeys.currentMonthExpense, queryKeys.todayMeals, queryKeys.todayReminders].some(
          (k) => k[0] === q.queryKey[0]
        ),
    });
    setRefreshing(false);
  }

  const meals = mealsQuery.data ?? [];
  const reminders = remindersQuery.data ?? [];

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="home" title="Dasbor Keluarga" subtitle="Ringkasan hari ini, Denny & Wulan" />
      </View>
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      <Card accent>
        <Text className="text-xs text-muted">Saldo Saat Ini</Text>
        <Text className="mt-1 text-3xl font-bold text-ink">
          {balanceQuery.data ? formatRupiah(balanceQuery.data.balance ?? 0) : '—'}
        </Text>
        <Text className="mt-2 text-xs text-muted">
          Pengeluaran bulan ini:{' '}
          {expenseQuery.data ? formatRupiah(expenseQuery.data.total_pengeluaran_bulan_ini ?? 0) : '—'}
        </Text>
      </Card>

      <View className="mb-2 mt-5 flex-row items-center gap-1.5">
        <Ionicons name="restaurant-outline" size={14} color="#9AA0A8" />
        <Text className="text-sm font-semibold text-ink">Menu Hari Ini</Text>
      </View>
      <Card>
        {meals.length === 0 && <EmptyState icon="restaurant-outline" text="Belum ada menu diisi hari ini." />}
        {meals.map((m: NonNullable<typeof meals>[number]) => (
          <View key={m.id} className="flex-row justify-between py-2">
            <Text className="capitalize text-muted">{m.meal_type}</Text>
            <Text className="flex-shrink text-right font-medium text-ink">{m.menu_description}</Text>
          </View>
        ))}
      </Card>

      <View className="mb-2 mt-5 flex-row items-center gap-1.5">
        <Ionicons name="notifications-outline" size={14} color="#9AA0A8" />
        <Text className="text-sm font-semibold text-ink">Pengingat Hari Ini</Text>
      </View>
      <Card className="mb-4">
        {reminders.length === 0 && (
          <EmptyState icon="notifications-outline" text="Tidak ada pengingat hari ini." />
        )}
        {reminders.map((r: NonNullable<typeof reminders>[number]) => (
          <View key={`${r.reminder_id}-${r.occurs_at}`} className="flex-row justify-between py-2">
            <Text className="text-muted">
              {new Date(r.occurs_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text className="flex-shrink text-right font-medium text-ink">{r.title}</Text>
          </View>
        ))}
      </Card>

      <DashboardTrends />
      </ScrollView>
    </View>
  );
}

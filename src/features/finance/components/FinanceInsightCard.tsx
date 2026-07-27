import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FinanceInsight } from '../lib/insights';
import { useThemeVars } from '../../../shared/theme/useThemeVars';

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FinanceInsightCard({ insight }: { insight: FinanceInsight }) {
  const {
    pctChangeExpense,
    topCategoryThisMonth,
    fastestRisingCategory,
    projectedEndBalance,
    daysLeftInMonth,
  } = insight;
  const { primaryDark } = useThemeVars();

  return (
    <View className="mb-4 rounded-2xl bg-primary-soft p-4">
      <View className="mb-2 flex-row items-center gap-1.5">
        <Ionicons name="sparkles-outline" size={16} color={primaryDark} />
        <Text className="text-sm font-bold text-primary-dark">Ringkasan Bulan Ini</Text>
      </View>

      {pctChangeExpense != null ? (
        <Text className="mb-1.5 text-sm text-ink">
          Pengeluaran bulan ini{' '}
          <Text className="font-semibold text-ink">
            {pctChangeExpense >= 0 ? 'naik' : 'turun'} {Math.abs(pctChangeExpense).toFixed(0)}%
          </Text>{' '}
          dibanding bulan lalu.
        </Text>
      ) : (
        <Text className="mb-1.5 text-sm text-ink">
          Belum ada data pengeluaran bulan lalu untuk dibandingkan.
        </Text>
      )}

      {topCategoryThisMonth && (
        <Text className="mb-1.5 text-sm text-ink">
          Kategori paling boros:{' '}
          <Text className="font-semibold text-ink">
            {topCategoryThisMonth.category} ({formatRupiah(topCategoryThisMonth.total)})
          </Text>
          .
        </Text>
      )}

      {fastestRisingCategory && (
        <Text className="mb-1.5 text-sm text-ink">
          <Text className="font-semibold capitalize text-ink">{fastestRisingCategory.category}</Text> naik paling
          tajam, {fastestRisingCategory.pctChange.toFixed(0)}% dari bulan lalu.
        </Text>
      )}

      {projectedEndBalance != null && (
        <Text className="mb-1.5 text-sm text-ink">
          Proyeksi saldo akhir bulan (sisa {daysLeftInMonth} hari):{' '}
          <Text className="font-semibold text-ink">{formatRupiah(projectedEndBalance)}</Text>.
        </Text>
      )}

      <Text className="mt-2 text-[10px] italic text-subtle">
        Dihitung otomatis dari data yang kalian catat sendiri — bukan pengganti nasihat perencana
        keuangan profesional.
      </Text>
    </View>
  );
}

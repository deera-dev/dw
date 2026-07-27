import React from 'react';
import { View, Text } from 'react-native';
import { useMonthlySummary } from '../../finance/hooks/useFinance';
import { useRecentWeightLogsAllProfiles } from '../../health/hooks/useHealth';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import Card from '../../../shared/ui/Card';

function formatRupiahShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`;
  return String(Math.round(n));
}

function formatMonthShort(month: string) {
  const d = new Date(month);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString('id-ID', { month: 'short' });
}

// Tren pengeluaran 6 bulan terakhir — bar chart ringan tanpa library tambahan,
// konsisten dengan pola WeightTrend di modul Kesehatan.
function ExpenseTrendChart() {
  const { data = [] } = useMonthlySummary();

  const byMonth = new Map<string, number>();
  data
    .filter((r) => r.type === 'pengeluaran' && r.month)
    .forEach((r) => {
      const key = r.month as string;
      byMonth.set(key, (byMonth.get(key) ?? 0) + (r.total ?? 0));
    });

  const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);

  if (months.length === 0) {
    return <Text className="py-4 text-center text-xs text-subtle">Belum ada data pengeluaran.</Text>;
  }

  const totals = months.map(([, total]) => total);
  const max = Math.max(...totals, 1);

  return (
    <View className="mt-2 flex-row items-end gap-2" style={{ height: 90 }}>
      {months.map(([month, total]) => {
        const heightPct = 10 + (total / max) * 70;
        return (
          <View key={month} className="flex-1 items-center">
            <Text className="mb-1 text-[9px] text-muted">{formatRupiahShort(total)}</Text>
            <View className="w-full rounded-md bg-primary-soft" style={{ height: heightPct }} />
            <Text className="mt-1 text-[9px] capitalize text-subtle">{formatMonthShort(month)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Tren berat badan gabungan Denny & Wulan — dua mini-chart berdampingan
// memakai warna yang sama (aksen tema), biar konsisten dengan modul Kesehatan.
function WeightTrendMini({ name, weights }: { name: string; weights: { id: string; weight_kg: number }[] }) {
  if (weights.length === 0) {
    return (
      <View className="flex-1">
        <Text className="mb-1 text-xs font-semibold capitalize text-ink">{name}</Text>
        <Text className="text-[10px] text-subtle">Belum ada catatan.</Text>
      </View>
    );
  }
  const values = weights.map((w) => w.weight_kg);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <View className="flex-1">
      <Text className="mb-1 text-xs font-semibold text-ink">{name}</Text>
      <View className="flex-row items-end gap-1" style={{ height: 44 }}>
        {weights.map((w) => {
          const heightPct = 14 + ((w.weight_kg - min) / range) * 30;
          return <View key={w.id} className="flex-1 rounded-sm bg-primary-dark" style={{ height: heightPct }} />;
        })}
      </View>
      <Text className="mt-1 text-[10px] text-muted">
        {values[values.length - 1]} kg terakhir
      </Text>
    </View>
  );
}

function WeightTrendSection() {
  const { data: allLogs = [] } = useRecentWeightLogsAllProfiles();
  const profiles = useProfilesList();

  return (
    <View className="mt-2 flex-row gap-4">
      {profiles.map((p) => {
        const logs = allLogs
          .filter((l) => l.created_by === p.id)
          .slice(0, 6)
          .reverse();
        return <WeightTrendMini key={p.id} name={p.name} weights={logs} />;
      })}
    </View>
  );
}

export default function DashboardTrends() {
  return (
    <>
      <Text className="mb-2 mt-5 text-sm font-semibold text-ink">Tren Pengeluaran (6 Bulan)</Text>
      <Card className="mb-4">
        <ExpenseTrendChart />
      </Card>

      <Text className="mb-2 text-sm font-semibold text-ink">Tren Berat Badan</Text>
      <Card className="mb-4">
        <WeightTrendSection />
      </Card>
    </>
  );
}

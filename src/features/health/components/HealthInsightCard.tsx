import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import {
  useRecentWeightLogsAllProfiles,
  useRecentBloodPressureAllProfiles,
  useRecentSmokingAllProfiles,
} from '../hooks/useHealth';
import { computeHealthInsightForPerson } from '../lib/insights';
import { useThemeVars } from '../../../shared/theme/useThemeVars';

export default function HealthInsightCard() {
  const profiles = useProfilesList();
  const { data: weightLogs = [] } = useRecentWeightLogsAllProfiles();
  const { data: bpLogs = [] } = useRecentBloodPressureAllProfiles();
  const { data: smokingLogs = [] } = useRecentSmokingAllProfiles();
  const { primaryDark } = useThemeVars();

  const insights = profiles.map((p) =>
    computeHealthInsightForPerson(
      p,
      weightLogs.filter((w) => w.created_by === p.id),
      bpLogs.filter((b) => b.created_by === p.id),
      smokingLogs.filter((s) => s.created_by === p.id)
    )
  );

  return (
    <View className="mb-4 rounded-2xl bg-primary-soft p-4">
      <View className="mb-2 flex-row items-center gap-1.5">
        <Ionicons name="sparkles-outline" size={16} color={primaryDark} />
        <Text className="text-sm font-bold text-primary-dark">Ringkasan Tren Kesehatan</Text>
      </View>

      {insights.map((insight, idx) => (
        <View
          key={insight.name}
          className={`mb-2 pb-2 ${idx < insights.length - 1 ? 'border-b border-primary/10' : ''}`}
        >
          <Text className="mb-1 text-xs font-semibold capitalize text-ink">{insight.name}</Text>
          {insight.bmiLine ? (
            <Text className="mb-0.5 text-sm text-ink">{insight.bmiLine}</Text>
          ) : (
            <Text className="mb-0.5 text-sm text-ink">Belum ada data tinggi/berat lengkap.</Text>
          )}
          {insight.weightTrend && (
            <Text className="mb-0.5 text-sm text-ink">
              Berat {insight.weightTrend.direction}{' '}
              {insight.weightTrend.direction !== 'stabil' && `${insight.weightTrend.deltaKg.toFixed(1)} kg `}
              dari beberapa catatan terakhir.
            </Text>
          )}
          {insight.bpTrendLine && <Text className="mb-0.5 text-sm text-ink">{insight.bpTrendLine}</Text>}
          {insight.smokingLine && <Text className="text-sm text-ink">{insight.smokingLine}</Text>}
        </View>
      ))}

      <Text className="mt-2 text-[10px] italic text-subtle">
        Dihitung otomatis dari data yang kalian catat sendiri, dibandingkan standar umum (BMI, tensi) —
        bukan pengganti nasihat dokter.
      </Text>
    </View>
  );
}

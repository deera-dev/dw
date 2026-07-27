import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { confirmAction } from '../../../shared/lib/confirm';
import { useAuthStore } from '../../auth/store/authStore';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import { useRecentWeightLogsAllProfiles, useDeleteWeightLog } from '../hooks/useHealth';
import { useWeightFormStore } from '../store/weightFormStore';
import AddWeightModal from '../components/AddWeightModal';
import {
  BMI_CATEGORY_LABEL,
  calculateBmi,
  categorizeBmi,
  idealWeightRangeKg,
} from '../../../shared/lib/bmi';
import type { Tables } from '../../../shared/types/database';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import HydrationSection from '../components/HydrationSection';
import BloodPressureSection from '../components/BloodPressureSection';
import SmokingSection from '../components/SmokingSection';
import HealthInsightCard from '../components/HealthInsightCard';

type Profile = Tables<'profiles'>;
type WeightLog = Tables<'weight_logs'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function WeightTrend({ logs }: { logs: WeightLog[] }) {
  if (logs.length === 0) return null;
  const recent = logs.slice(0, 6).reverse();
  const weights = recent.map((l) => l.weight_kg);
  const max = Math.max(...weights);
  const min = Math.min(...weights);
  const range = max - min || 1;

  return (
    <View className="mt-3 flex-row items-end gap-2" style={{ height: 56 }}>
      {recent.map((log) => {
        const heightPct = 16 + ((log.weight_kg - min) / range) * 34;
        return (
          <View key={log.id} className="flex-1 items-center">
            <View className="w-full rounded-md bg-primary-soft" style={{ height: heightPct }} />
            <Text className="mt-1 text-[9px] text-subtle">{formatDate(log.recorded_at)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ProfileHealthCard({
  profile,
  logs,
  isSelf,
}: {
  profile: Profile;
  logs: WeightLog[];
  isSelf: boolean;
}) {
  const openWeightModal = useWeightFormStore((s) => s.openModal);
  const openEditWeightModal = useWeightFormStore((s) => s.openEditModal);
  const deleteWeight = useDeleteWeightLog(profile.id);
  const latest = logs[0];
  const bmi = latest && profile.height_cm ? calculateBmi(latest.weight_kg, profile.height_cm) : null;
  const category = bmi ? categorizeBmi(bmi) : null;
  const ideal = profile.height_cm ? idealWeightRangeKg(profile.height_cm) : null;

  function handleTapLatest() {
    if (!isSelf || !latest) return;
    openEditWeightModal(latest.id, latest.weight_kg, profile.height_cm);
  }

  function handleDeleteLatest() {
    if (!isSelf || !latest) return;
    confirmAction({
      title: 'Hapus catatan berat ini?',
      message: `${latest.weight_kg} kg — ${formatDate(latest.recorded_at)}`,
      onConfirm: () => deleteWeight.mutate(latest.id),
    });
  }

  return (
    <View className="mb-4 rounded-2xl border-l-4 border-primary bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold capitalize text-ink">{profile.name}</Text>
        {isSelf && (
          <Pressable
            onPress={() => openWeightModal(profile.height_cm)}
            className="rounded-full bg-primary px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-white">+ Catat berat & tinggi</Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-muted">Berat terkini</Text>
          <View className="flex-row items-center gap-1.5">
            <Pressable onPress={handleTapLatest}>
              <Text className="mt-0.5 text-2xl font-bold text-ink">
                {latest ? `${latest.weight_kg} kg` : '—'}
              </Text>
            </Pressable>
            {isSelf && latest && (
              <Pressable hitSlop={10} className="p-1" onPress={handleDeleteLatest}>
                <Ionicons name="trash-outline" size={14} color="#E5766D" />
              </Pressable>
            )}
          </View>
          {latest && (
            <Text className="text-[10px] text-subtle">
              {formatDate(latest.recorded_at)}
              {isSelf ? ' · ketuk untuk edit' : ''}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted">Tinggi</Text>
          <Text className="mt-0.5 text-sm text-ink">
            {profile.height_cm ? `${profile.height_cm} cm` : 'Belum diisi'}
          </Text>
        </View>
      </View>

      {bmi && category && (
        <View className="mt-3 rounded-xl bg-primary-soft p-3">
          <Text className="text-xs font-semibold text-primary-dark">
            BMI {bmi.toFixed(1)} — {BMI_CATEGORY_LABEL[category]}
          </Text>
          {ideal && (
            <Text className="mt-0.5 text-[11px] text-muted">
              Berat ideal: {ideal.min}–{ideal.max} kg
            </Text>
          )}
        </View>
      )}

      <WeightTrend logs={logs} />

      <Text className="mt-3 text-[10px] italic text-subtle">
        Info umum berdasarkan rumus BMI standar, bukan pengganti pemeriksaan medis.
      </Text>
    </View>
  );
}

export default function HealthScreen({ showHeader = true }: { showHeader?: boolean } = {}) {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const { data: allLogs = [] } = useRecentWeightLogsAllProfiles();
  const [showInsight, setShowInsight] = useState(false);
  const { primary } = useThemeVars();

  const myProfile = profiles.find((p) => p.id === session?.user.id);
  const partnerProfile = profiles.find((p) => p.id !== session?.user.id);

  const logsFor = (userId?: string) => allLogs.filter((l) => l.created_by === userId);

  return (
    <View className="flex-1 bg-surface">
      {showHeader && (
        <View className="px-4 pt-4">
          <ScreenHeader icon="heart" title="Kesehatan" subtitle="Berat, tinggi & BMI Denny & Wulan" />
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: showHeader ? 0 : 16, paddingBottom: 16 }}
      >
      <Pressable
        className="mb-4 flex-row items-center justify-center gap-1.5 rounded-xl border border-primary p-3"
        onPress={() => setShowInsight((v) => !v)}
      >
        <Ionicons name="sparkles-outline" size={15} color={primary} />
        <Text className="text-sm font-semibold text-primary">
          {showInsight ? 'Sembunyikan Tren' : 'Lihat Tren'}
        </Text>
      </Pressable>

      {showInsight && <HealthInsightCard />}

      <HydrationSection />
      <BloodPressureSection />
      <SmokingSection />

      {myProfile && <ProfileHealthCard profile={myProfile} logs={logsFor(myProfile.id)} isSelf />}
      {partnerProfile && (
        <ProfileHealthCard profile={partnerProfile} logs={logsFor(partnerProfile.id)} isSelf={false} />
      )}

      <AddWeightModal />
      </ScrollView>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import { useAddSmokingLog, useDeleteSmokingLog, useTodaySmokingAllProfiles } from '../hooks/useHealth';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import type { Tables } from '../../../shared/types/database';
import { confirmAction } from '../../../shared/lib/confirm';

type Profile = Tables<'profiles'>;

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function ProfileSmokingRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const { data: logs = [] } = useTodaySmokingAllProfiles();
  const addSmoking = useAddSmokingLog(profile.id);
  const deleteSmoking = useDeleteSmokingLog(profile.id);
  const { primary } = useThemeVars();
  const [showHistory, setShowHistory] = useState(false);

  const myLogs = [...logs.filter((l) => l.created_by === profile.id)].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );
  const total = myLogs.reduce((s, l) => s + l.cigarette_count, 0);
  const perStickCost = profile.cigarettes_per_pack > 0 ? profile.cigarette_pack_price / profile.cigarettes_per_pack : 0;
  const estimatedCostToday = perStickCost * total;

  function handleDelete(id: string, time: string) {
    confirmAction({
      title: 'Hapus catatan rokok ini?',
      message: `Pukul ${time}`,
      onConfirm: () => deleteSmoking.mutate(id),
    });
  }

  return (
    <View className="mb-2.5 rounded-xl bg-surface p-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold capitalize text-ink">{profile.name}</Text>
          <Pressable onPress={() => myLogs.length > 0 && setShowHistory((v) => !v)}>
            <Text className="mt-0.5 text-xs text-muted">
              {total} batang hari ini
              {myLogs.length > 0 ? (showHistory ? ' · sembunyikan riwayat' : ' · lihat riwayat') : ''}
            </Text>
          </Pressable>
          <Text className="mt-0.5 text-[11px] text-subtle">
            Estimasi biaya hari ini: {formatRupiah(estimatedCostToday)}
          </Text>
        </View>
        {isSelf && (
          <Pressable
            onPress={() => addSmoking.mutate(1)}
            className="items-center justify-center rounded-full bg-primary-soft px-3 py-2"
          >
            <Text className="text-xs font-semibold text-primary">+1 batang</Text>
          </Pressable>
        )}
      </View>

      {showHistory && myLogs.length > 0 && (
        <View className="mt-2.5 border-t border-border pt-2">
          {myLogs.map((log) => (
            <View key={log.id} className="flex-row items-center justify-between py-1">
              <Text className="text-xs text-muted">
                {log.cigarette_count > 1 ? `${log.cigarette_count} batang` : '1 batang'} ·{' '}
                {formatTime(log.recorded_at)}
              </Text>
              {isSelf && (
                <Pressable hitSlop={10} className="p-1" onPress={() => handleDelete(log.id, formatTime(log.recorded_at))}>
                  <Ionicons name="trash-outline" size={14} color="#E5766D" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SmokingSection() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const myProfile = profiles.find((p) => p.id === session?.user.id);
  const partnerProfile = profiles.find((p) => p.id !== session?.user.id);

  const anySmoker = Boolean(myProfile?.is_smoker || partnerProfile?.is_smoker);
  if (!anySmoker) return null;

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center gap-1.5">
        <Ionicons name="flame-outline" size={16} color="#9AA0A8" />
        <Text className="text-base font-bold text-ink">Rokok Hari Ini</Text>
      </View>
      {myProfile?.is_smoker && <ProfileSmokingRow profile={myProfile} isSelf />}
      {partnerProfile?.is_smoker && <ProfileSmokingRow profile={partnerProfile} isSelf={false} />}
      <Text className="mt-1 text-[10px] italic text-subtle">
        Ketuk jumlah batang untuk lihat & hapus catatan satu per satu kalau salah tekan.
      </Text>
      <Text className="mt-1 text-[10px] italic text-subtle">
        Rokok meningkatkan risiko penyakit jantung & paru-paru — info ini untuk kesadaran, bukan pengganti
        saran medis.
      </Text>
    </View>
  );
}

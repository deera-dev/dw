import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import { useAddWaterGlass, useDeleteWaterLog, useTodayWaterAllProfiles } from '../hooks/useHealth';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import type { Tables } from '../../../shared/types/database';
import { confirmAction } from '../../../shared/lib/confirm';
import { formatMl, glassesToMl, WATER_GLASS_ML } from '../../../shared/lib/hydration';

type Profile = Tables<'profiles'>;

// Menjelang malam (>= jam 18:00) dan target belum tercapai — disorot supaya
// pasangan bisa saling mengingatkan (PRD §3 prinsip "Akuntabilitas berdua").
function isEveningNotYetReached(total: number, target: number) {
  return new Date().getHours() >= 18 && total < target;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function ProfileWaterRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const { data: logs = [] } = useTodayWaterAllProfiles();
  const addWater = useAddWaterGlass(profile.id);
  const deleteWater = useDeleteWaterLog();
  const { primary } = useThemeVars();
  const [showHistory, setShowHistory] = useState(false);

  // Urut dari yang paling baru biar konsisten dengan pola riwayat di modul lain.
  const myLogs = [...logs.filter((l) => l.created_by === profile.id)].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );
  const total = myLogs.reduce((s, l) => s + l.amount_glasses, 0);
  const target = profile.daily_water_target_glasses;
  const behind = isEveningNotYetReached(total, target);
  const pct = Math.min(100, Math.round((total / target) * 100));

  function handleDelete(id: string, time: string) {
    confirmAction({
      title: 'Hapus catatan minum ini?',
      message: `Pukul ${time}`,
      onConfirm: () => deleteWater.mutate(id),
    });
  }

  return (
    <View className={`mb-2.5 rounded-xl p-3 ${behind ? 'bg-danger/5' : 'bg-surface'}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-semibold capitalize text-ink">{profile.name}</Text>
            {behind && (
              <Text className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                Belum tercapai
              </Text>
            )}
          </View>
          <Pressable onPress={() => myLogs.length > 0 && setShowHistory((v) => !v)}>
            <Text className="mt-0.5 text-xs text-muted">
              {total}/{target} gelas ({formatMl(glassesToMl(total))}/{formatMl(glassesToMl(target))})
              {myLogs.length > 0 ? (showHistory ? ' · sembunyikan riwayat' : ' · lihat riwayat') : ''}
            </Text>
          </Pressable>
          <View className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <View className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </View>
        </View>
        {isSelf && (
          <Pressable
            onPress={() => addWater.mutate(1)}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft"
          >
            <Ionicons name="add" size={18} color={primary} />
          </Pressable>
        )}
      </View>

      {showHistory && myLogs.length > 0 && (
        <View className="mt-2.5 border-t border-border pt-2">
          {myLogs.map((log, idx) => (
            <View key={log.id} className="flex-row items-center justify-between py-1">
              <Text className="text-xs text-muted">
                Gelas ke-{myLogs.length - idx} · {formatTime(log.recorded_at)}
              </Text>
              {isSelf && (
                <Pressable
                  className="p-1"
                  onPress={() => handleDelete(log.id, formatTime(log.recorded_at))}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#8A8D94" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HydrationSection() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const myProfile = profiles.find((p) => p.id === session?.user.id);
  const partnerProfile = profiles.find((p) => p.id !== session?.user.id);

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center gap-1.5">
        <Ionicons name="water-outline" size={16} color="#9AA0A8" />
        <Text className="text-base font-bold text-ink">Hidrasi Hari Ini</Text>
      </View>
      {myProfile && <ProfileWaterRow profile={myProfile} isSelf />}
      {partnerProfile && <ProfileWaterRow profile={partnerProfile} isSelf={false} />}
      <Text className="mt-1 text-[10px] italic text-subtle">
        Ketuk jumlah gelas untuk lihat & hapus catatan satu per satu kalau salah tekan. 1 gelas = {WATER_GLASS_ML} ml.
      </Text>
      <Text className="mt-1 text-[10px] italic text-subtle">
        Kebutuhan cairan tiap orang bisa beda (tergantung berat badan & aktivitas) — target 8 gelas/hari cuma
        patokan umum. Target masing-masing bisa diatur sendiri di Pengaturan.
      </Text>
    </View>
  );
}

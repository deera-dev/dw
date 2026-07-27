import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesList } from '../../../shared/hooks/useProfiles';
import {
  useAddBloodPressureLog,
  useBloodPressureHistory,
  useDeleteBloodPressureLog,
  useRecentBloodPressureAllProfiles,
  useUpdateBloodPressureLog,
} from '../hooks/useHealth';
import { BP_CATEGORY_LABEL, categorizeBloodPressure } from '../../../shared/lib/bloodPressure';
import type { Tables } from '../../../shared/types/database';

type Profile = Tables<'profiles'>;
type BpLog = Tables<'blood_pressure_logs'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function categoryBadgeClass(category: ReturnType<typeof categorizeBloodPressure>) {
  if (category === 'normal') return 'bg-success/10 text-success';
  if (category === 'meningkat' || category === 'hipertensi_1') return 'bg-amber-500/10 text-amber-600';
  return 'bg-danger/10 text-danger';
}

// Menampilkan SEMUA catatan hari ini (bukan cuma "terkini") supaya jelas
// tensi memang boleh dicatat berkali-kali sehari (mis. pagi & malam) — bukan
// dibatasi satu kali seperti kesan sebelumnya.
function ProfileBpCard({ profile, logs }: { profile: Profile; logs: BpLog[] }) {
  const today = new Date();
  const todayLogs = logs.filter((l) => isSameDay(new Date(l.recorded_at), today));
  const latest = logs[0];

  if (!latest) {
    return (
      <View className="mb-2.5 rounded-xl bg-surface p-3">
        <Text className="text-sm font-semibold capitalize text-ink">{profile.name}</Text>
        <Text className="mt-0.5 text-xs text-subtle">Belum ada catatan.</Text>
      </View>
    );
  }

  return (
    <View className="mb-2.5 rounded-xl bg-surface p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold capitalize text-ink">{profile.name}</Text>
        <Text className="text-[10px] text-muted">
          {todayLogs.length > 0 ? `${todayLogs.length}x hari ini` : `terakhir ${formatDate(latest.recorded_at)}`}
        </Text>
      </View>

      {todayLogs.length > 0 ? (
        <View className="mt-1.5 gap-1.5">
          {todayLogs.map((log) => {
            const category = categorizeBloodPressure(log.systolic, log.diastolic);
            return (
              <View key={log.id} className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-ink">
                  {log.systolic}/{log.diastolic}
                  {log.pulse ? <Text className="text-xs font-normal text-muted"> · nadi {log.pulse}</Text> : null}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[10px] text-subtle">{formatTime(log.recorded_at)}</Text>
                  <Text
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(category)}`}
                  >
                    {BP_CATEGORY_LABEL[category]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text className="text-base font-bold text-subtle">
            {latest.systolic}/{latest.diastolic}
          </Text>
          <Text
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(
              categorizeBloodPressure(latest.systolic, latest.diastolic)
            )}`}
          >
            {BP_CATEGORY_LABEL[categorizeBloodPressure(latest.systolic, latest.diastolic)]}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function BloodPressureSection() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const myProfile = profiles.find((p) => p.id === session?.user.id);
  const partnerProfile = profiles.find((p) => p.id !== session?.user.id);

  const { data: allLogs = [] } = useRecentBloodPressureAllProfiles();
  const { data: myHistory = [] } = useBloodPressureHistory(session?.user.id);
  const addBp = useAddBloodPressureLog(session?.user.id);
  const updateBp = useUpdateBloodPressureLog(session?.user.id);
  const deleteBp = useDeleteBloodPressureLog(session?.user.id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [saving, setSaving] = useState(false);

  const logsFor = (userId?: string) => allLogs.filter((l) => l.created_by === userId);

  function openAddForm() {
    setEditingId(null);
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setShowForm((v) => !v);
  }

  function openEditForm(log: BpLog) {
    setEditingId(log.id);
    setSystolic(String(log.systolic));
    setDiastolic(String(log.diastolic));
    setPulse(log.pulse ? String(log.pulse) : '');
    setShowForm(true);
  }

  async function handleSave() {
    const sys = Number(systolic);
    const dia = Number(diastolic);
    const pul = pulse ? Number(pulse) : null;
    if (!sys || !dia || sys <= 0 || dia <= 0) {
      showAlert('Cek lagi', 'Isi sistol dan diastol dengan angka yang benar.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateBp.mutateAsync({ id: editingId, patch: { systolic: sys, diastolic: dia, pulse: pul } });
      } else {
        await addBp.mutateAsync({ systolic: sys, diastolic: dia, pulse: pul });
      }
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setEditingId(null);
      setShowForm(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, label: string) {
    confirmAction({
      title: 'Hapus catatan tensi?',
      message: label,
      onConfirm: () => deleteBp.mutate(id),
    });
  }

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="pulse-outline" size={16} color="#9AA0A8" />
          <Text className="text-base font-bold text-ink">Tensi Darah</Text>
        </View>
        <Pressable onPress={openAddForm}>
          <Text className="text-xs font-semibold text-primary">{showForm ? 'Batal' : '+ Catat'}</Text>
        </Pressable>
      </View>

      <Text className="mb-3 text-[11px] text-subtle">
        Bisa dicatat berkali-kali sehari (mis. pagi & malam) — semua catatan hari ini ditampilkan.
      </Text>

      {myProfile && <ProfileBpCard profile={myProfile} logs={logsFor(myProfile.id)} />}
      {partnerProfile && <ProfileBpCard profile={partnerProfile} logs={logsFor(partnerProfile.id)} />}

      {showForm && (
        <View className="mt-1 border-t border-border pt-3">
          <View className="mb-3 flex-row gap-2">
            <TextInput
        style={{ color: '#EDEDED' }}
              className="flex-1 rounded-xl border border-border p-3 text-sm text-ink"
              placeholder="Sistol"
              keyboardType="number-pad"
              value={systolic}
              onChangeText={setSystolic}
            />
            <TextInput
        style={{ color: '#EDEDED' }}
              className="flex-1 rounded-xl border border-border p-3 text-sm text-ink"
              placeholder="Diastol"
              keyboardType="number-pad"
              value={diastolic}
              onChangeText={setDiastolic}
            />
            <TextInput
        style={{ color: '#EDEDED' }}
              className="flex-1 rounded-xl border border-border p-3 text-sm text-ink"
              placeholder="Nadi (opsional)"
              keyboardType="number-pad"
              value={pulse}
              onChangeText={setPulse}
            />
          </View>
          <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleSave} disabled={saving}>
            <Text className="font-semibold text-white">
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
            </Text>
          </Pressable>
        </View>
      )}

      {myHistory.length > 0 && (
        <View className="mt-3 border-t border-border pt-2">
          <Text className="mb-1.5 text-xs font-semibold text-muted">Riwayat kamu</Text>
          {myHistory.slice(0, 6).map((log) => (
            <Pressable
              key={log.id}
              onPress={() => openEditForm(log)}
              className="flex-row items-center justify-between py-1.5"
            >
              <Text className="text-sm text-ink">
                {log.systolic}/{log.diastolic}
                {log.pulse ? ` · nadi ${log.pulse}` : ''}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-muted">
                  {formatDate(log.recorded_at)} · {formatTime(log.recorded_at)}
                </Text>
                <Pressable
                  hitSlop={10}
                  onPress={() =>
                    handleDelete(
                      log.id,
                      `${log.systolic}/${log.diastolic} — ${formatDate(log.recorded_at)} ${formatTime(log.recorded_at)}`
                    )
                  }
                  className="p-1"
                >
                  <Ionicons name="trash-outline" size={14} color="#E5766D" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Text className="mt-3 text-[10px] italic text-subtle">
        Kategori berdasarkan acuan umum AHA/Kemenkes, bukan diagnosis — kalau angka mencurigakan, tetap
        konsultasi ke dokter.
      </Text>
    </View>
  );
}

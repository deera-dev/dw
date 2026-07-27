import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import { useAllReminders, useAddReminder, useDeactivateReminder } from '../../reminders/hooks/useReminders';
import { useProfilesMap } from '../../../shared/hooks/useProfiles';
import DatePickerField from '../../../shared/ui/DatePickerField';

function nextOccurrence(day: number, month: number) {
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day, 8, 0, 0);
  if (candidate.getTime() < now.setHours(0, 0, 0, 0)) year += 1;
  return new Date(year, month - 1, day, 8, 0, 0);
}

function formatDayMonth(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
}

export default function ImportantDatesSection() {
  const session = useAuthStore((s) => s.session);
  const { data: reminders = [] } = useAllReminders();
  const profiles = useProfilesMap();
  const addReminder = useAddReminder();
  const deactivateReminder = useDeactivateReminder();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [pickedDate, setPickedDate] = useState(''); // 'YYYY-MM-DD', tahun diabaikan (berulang tahunan)
  const [saving, setSaving] = useState(false);

  const importantDates = reminders.filter((r) => r.category === 'tanggal_penting');

  async function handleAdd() {
    if (!session) return;
    if (!title.trim() || !pickedDate) {
      showAlert('Cek lagi', 'Isi judul dan pilih tanggalnya.');
      return;
    }
    const [, m, d] = pickedDate.split('-').map(Number);
    setSaving(true);
    try {
      await addReminder.mutateAsync({
        created_by: session.user.id,
        title: title.trim(),
        category: 'tanggal_penting',
        recurrence: 'tahunan',
        start_at: nextOccurrence(d, m).toISOString(),
        is_urgent: false,
      });
      setTitle('');
      setPickedDate('');
      setShowForm(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, t: string) {
    confirmAction({
      title: 'Hapus tanggal penting?',
      message: t,
      onConfirm: () => deactivateReminder.mutate(id),
    });
  }

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-base font-bold text-ink">Tanggal Penting</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text className="text-xs font-semibold text-primary">{showForm ? 'Batal' : '+ Tambah'}</Text>
        </Pressable>
      </View>

      {importantDates.length === 0 && !showForm && (
        <Text className="text-xs italic text-subtle">
          Belum ada — mis. ulang tahun atau tanggal pernikahan, diingatkan otomatis tiap tahun.
        </Text>
      )}

      {importantDates.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center justify-between border-b border-border py-2.5"
        >
          <View>
            <Text className="text-sm font-medium text-ink">{item.title}</Text>
            <Text className="mt-0.5 text-[11px] text-muted">
              {formatDayMonth(item.start_at)} · dicatat {profiles[item.created_by] ?? '—'}
            </Text>
          </View>
          <Pressable hitSlop={10} className="p-1" onPress={() => handleDelete(item.id, item.title)}>
            <Ionicons name="trash-outline" size={16} color="#E5766D" />
          </Pressable>
        </View>
      ))}

      {showForm && (
        <View className="mt-3 border-t border-border pt-3">
          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-2.5 rounded-xl border border-border p-3 text-sm text-ink"
            placeholder="Judul (mis. Ulang Tahun Denny)"
            value={title}
            onChangeText={setTitle}
          />
          <View className="mb-3">
            <DatePickerField value={pickedDate} onChange={setPickedDate} placeholder="Pilih tanggal & bulan" />
          </View>
          <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleAdd} disabled={saving}>
            <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

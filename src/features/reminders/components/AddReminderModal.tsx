import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../auth/store/authStore';
import { useAddReminder, useUpdateReminder } from '../hooks/useReminders';
import { useReminderFormStore } from '../store/reminderFormStore';
import type { Tables } from '../../../shared/types/database';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { showAlert } from '../../../shared/lib/confirm';
import { REMINDER_CATEGORY_LABEL, REMINDER_RECURRENCE_LABEL } from '../categoryLabels';
import TimePickerField from '../../../shared/ui/TimePickerField';
import ModalKeyboardWrapper from '../../../shared/ui/ModalKeyboardWrapper';

type Reminder = Tables<'reminders'>;

const RECURRENCE_OPTIONS: Array<Reminder['recurrence']> = [
  'sekali',
  'harian',
  'mingguan',
  'bulanan',
  'tahunan',
];
const CATEGORY_OPTIONS: Array<Reminder['category']> = [
  'umum',
  'obat',
  'tagihan',
  'tanggal_penting',
  'cek_kesehatan',
  'kontrol_dokter',
];

export default function AddReminderModal() {
  const session = useAuthStore((s) => s.session);
  const form = useReminderFormStore();
  const addReminder = useAddReminder();
  const updateReminder = useUpdateReminder();
  const [saving, setSaving] = useState(false);
  const [newTime, setNewTime] = useState('');
  const { themeVars } = useThemeVars();
  const isEditing = Boolean(form.editingId);
  const isDaily = form.recurrence === 'harian';

  function handleAddTime() {
    if (!newTime) return;
    form.addDailyTime(newTime);
    setNewTime('');
  }

  async function handleSave() {
    if (!session || !form.title.trim()) return;
    setSaving(true);
    try {
      // dailyTimes cuma relevan kalau recurrence 'harian' & user isi minimal 1
      // jam — kalau kosong, jatuh balik ke perilaku lama (1x sehari, jam
      // dibuat/diedit).
      const dailyTimes = isDaily && form.dailyTimes.length > 0 ? form.dailyTimes : null;
      if (form.editingId) {
        await updateReminder.mutateAsync({
          id: form.editingId,
          patch: {
            title: form.title.trim(),
            category: form.category,
            recurrence: form.recurrence,
            daily_times: dailyTimes,
          },
        });
      } else {
        await addReminder.mutateAsync({
          created_by: session.user.id,
          title: form.title.trim(),
          category: form.category,
          recurrence: form.recurrence,
          daily_times: dailyTimes,
          start_at: new Date().toISOString(),
        });
      }
      form.reset();
      form.closeModal();
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={form.modalVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
      <ModalKeyboardWrapper>
        <View style={themeVars} className="rounded-t-3xl bg-card p-5">
          <Text className="mb-4 font-title text-lg font-bold text-ink">
            {isEditing ? 'Edit Pengingat' : 'Pengingat Baru'}
          </Text>

          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Judul pengingat"
            value={form.title}
            onChangeText={form.setTitle}
          />

          <Text className="mb-1.5 mt-1 text-xs text-muted">Kategori</Text>
          <View className="mb-2.5 flex-row flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => (
              <Pressable
                key={c}
                className={`rounded-full border px-3 py-2 ${
                  form.category === c ? 'border-primary bg-primary' : 'border-border'
                }`}
                onPress={() => form.setCategory(c)}
              >
                <Text className={`text-xs ${form.category === c ? 'text-white' : 'text-ink'}`}>
                  {REMINDER_CATEGORY_LABEL[c]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-1.5 mt-1 text-xs text-muted">Pengulangan</Text>
          <View className="mb-2.5 flex-row flex-wrap gap-2">
            {RECURRENCE_OPTIONS.map((r) => (
              <Pressable
                key={r}
                className={`rounded-full border px-3 py-2 ${
                  form.recurrence === r ? 'border-primary bg-primary' : 'border-border'
                }`}
                onPress={() => form.setRecurrence(r)}
              >
                <Text className={`text-xs ${form.recurrence === r ? 'text-white' : 'text-ink'}`}>
                  {REMINDER_RECURRENCE_LABEL[r]}
                </Text>
              </Pressable>
            ))}
          </View>

          {isDaily && (
            <View className="mb-2.5">
              <Text className="mb-1.5 mt-1 text-xs text-muted">
                Jam pengingat (opsional — kosongkan buat 1x sehari seperti biasa)
              </Text>
              <Text className="mb-2 text-[10px] text-subtle">
                Buat pengingat yang perlu lebih dari 1x sehari (mis. minum obat pagi/siang/malam), tambahkan tiap
                jamnya di sini.
              </Text>

              {form.dailyTimes.length > 0 && (
                <View className="mb-2 flex-row flex-wrap gap-2">
                  {form.dailyTimes.map((t) => (
                    <View
                      key={t}
                      className="flex-row items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-3 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-ink">{t}</Text>
                      <Pressable hitSlop={6} onPress={() => form.removeDailyTime(t)}>
                        <Ionicons name="close-circle" size={14} color="#8A8D94" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-row items-center gap-2">
                <TimePickerField value={newTime} onChange={setNewTime} placeholder="Pilih jam" className="flex-1" />
                <Pressable
                  className="rounded-xl border border-primary px-3 py-3"
                  onPress={handleAddTime}
                  disabled={!newTime}
                >
                  <Ionicons name="add" size={18} color="#4C7EF3" />
                </Pressable>
              </View>
            </View>
          )}

          <View className="mt-2 flex-row justify-end gap-3">
            <Pressable className="p-3" onPress={form.closeModal}>
              <Text className="font-semibold text-ink">Batal</Text>
            </Pressable>
            <Pressable className="rounded-xl bg-primary px-5 py-3" onPress={handleSave} disabled={saving}>
              <Text className="font-semibold text-white">
                {saving ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ModalKeyboardWrapper>
      </View>
    </Modal>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { useAddWeightLog, useUpdateWeightLog, useUpdateHeight } from '../hooks/useHealth';
import { useWeightFormStore } from '../store/weightFormStore';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { showAlert } from '../../../shared/lib/confirm';
import BottomSheetModal from '../../../shared/ui/BottomSheetModal';

export default function AddWeightModal() {
  const session = useAuthStore((s) => s.session);
  const form = useWeightFormStore();
  const addWeight = useAddWeightLog(session?.user.id);
  const updateWeight = useUpdateWeightLog(session?.user.id);
  const updateHeight = useUpdateHeight(session?.user.id);
  const [saving, setSaving] = useState(false);
  const { themeVars } = useThemeVars();
  const isEditing = Boolean(form.editingId);

  async function handleSave() {
    const weightValue = Number(form.weight.replace(',', '.'));
    if (!weightValue || weightValue <= 0) {
      showAlert('Cek lagi', 'Isi berat badan (kg) dengan angka yang benar.');
      return;
    }
    const heightValue = form.height.trim() ? Number(form.height.replace(',', '.')) : null;
    if (form.height.trim() && (!heightValue || heightValue <= 0)) {
      showAlert('Cek lagi', 'Isi tinggi badan (cm) dengan angka yang benar, atau kosongkan.');
      return;
    }
    setSaving(true);
    try {
      if (form.editingId) {
        await updateWeight.mutateAsync({ id: form.editingId, patch: { weight_kg: weightValue } });
      } else {
        await addWeight.mutateAsync(weightValue);
      }
      if (heightValue) {
        await updateHeight.mutateAsync(heightValue);
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
    <BottomSheetModal visible={form.modalVisible} onClose={form.closeModal}>
        <View style={themeVars} className="rounded-t-3xl bg-card p-5">
          <Text className="mb-4 font-title text-lg font-bold text-ink">
            {isEditing ? 'Edit Berat & Tinggi' : 'Catat Berat & Tinggi'}
          </Text>

          <Text className="mb-1 text-xs text-muted">Berat badan (kg)</Text>
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="mis. 68.5"
            keyboardType="decimal-pad"
            value={form.weight}
            onChangeText={form.setWeight}
            autoFocus
          />

          <Text className="mb-1 text-xs text-muted">Tinggi badan (cm)</Text>
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-1 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="mis. 165"
            keyboardType="decimal-pad"
            value={form.height}
            onChangeText={form.setHeight}
          />
          <Text className="mb-3 text-[11px] text-subtle">
            Kosongkan kalau tinggi tidak berubah dari sebelumnya.
          </Text>

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
    </BottomSheetModal>
  );
}

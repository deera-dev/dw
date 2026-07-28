import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { useAddRecipe, useUpdateRecipe } from '../hooks/useRecipes';
import { useRecipeFormStore } from '../store/recipeFormStore';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { showAlert } from '../../../shared/lib/confirm';
import BottomSheetModal from '../../../shared/ui/BottomSheetModal';

export default function AddRecipeModal() {
  const session = useAuthStore((s) => s.session);
  const form = useRecipeFormStore();
  const addRecipe = useAddRecipe();
  const updateRecipe = useUpdateRecipe();
  const [saving, setSaving] = useState(false);
  const { themeVars } = useThemeVars();
  const isEditing = Boolean(form.editingId);

  async function handleSave() {
    if (!session || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        ingredients: form.ingredients.trim() || null,
        instructions: form.instructions.trim() || null,
      };
      if (form.editingId) {
        await updateRecipe.mutateAsync({ id: form.editingId, patch: payload });
      } else {
        await addRecipe.mutateAsync({ created_by: session.user.id, ...payload });
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
          <Text className="mb-4 font-title text-lg font-bold text-ink">{isEditing ? 'Edit Resep' : 'Resep Baru'}</Text>

          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Nama resep"
            value={form.name}
            onChangeText={form.setName}
          />
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Bahan-bahan (opsional)"
            multiline
            numberOfLines={3}
            value={form.ingredients}
            onChangeText={form.setIngredients}
          />
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Cara membuat (opsional)"
            multiline
            numberOfLines={3}
            value={form.instructions}
            onChangeText={form.setInstructions}
          />

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

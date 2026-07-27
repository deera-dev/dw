import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { useAddAccount, useUpdateAccount } from '../hooks/useFinance';
import { useAccountFormStore } from '../store/accountFormStore';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { showAlert } from '../../../shared/lib/confirm';
import { ACCOUNT_TYPE_LABEL, ACCOUNT_TYPE_OPTIONS } from '../lib/accountBalance';
import ModalKeyboardWrapper from '../../../shared/ui/ModalKeyboardWrapper';

export default function AddAccountModal() {
  const session = useAuthStore((s) => s.session);
  const form = useAccountFormStore();
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const [saving, setSaving] = useState(false);
  const { themeVars } = useThemeVars();
  const isEditing = Boolean(form.editingId);

  async function handleSave() {
    if (!session || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        // Saldo awal boleh kosong -> dianggap 0. Angka mentah, tidak perlu
        // validasi lanjut karena kolomnya numeric biasa (bukan check > 0),
        // saldo awal boleh negatif kalau memang akunnya lagi minus.
        initial_balance: Number(form.initialBalance.replace(/[^0-9-]/g, '')) || 0,
      };
      if (form.editingId) {
        await updateAccount.mutateAsync({ id: form.editingId, patch: payload });
      } else {
        // owner_id sengaja tidak diminta di form — default null (akun
        // bersama). Bisa ditambah pemilihan pemilik nanti kalau dibutuhkan.
        await addAccount.mutateAsync({ created_by: session.user.id, owner_id: null, ...payload });
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
            {isEditing ? 'Edit Akun' : 'Akun Baru'}
          </Text>

          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Nama akun (misal: BCA, Tabungan Rumah)"
            value={form.name}
            onChangeText={form.setName}
          />

          <Text className="mb-1.5 mt-1 text-xs text-muted">Jenis Akun</Text>
          <View className="mb-3 flex-row flex-wrap gap-2">
            {ACCOUNT_TYPE_OPTIONS.map((t) => (
              <Pressable
                key={t}
                className={`rounded-full border px-3 py-2 ${
                  form.type === t ? 'border-primary bg-primary' : 'border-border'
                }`}
                onPress={() => form.setType(t)}
              >
                <Text className={`text-xs ${form.type === t ? 'text-white' : 'text-ink'}`}>
                  {ACCOUNT_TYPE_LABEL[t]}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Saldo awal (Rp, opsional)"
            keyboardType="numeric"
            value={form.initialBalance}
            onChangeText={form.setInitialBalance}
          />
          <Text className="mb-2 text-[11px] text-subtle">
            Saldo saat ini otomatis dihitung dari saldo awal + transaksi yang tercatat di akun ini.
          </Text>

          <View className="mt-2 flex-row justify-end gap-3">
            <Pressable className="p-3" onPress={form.closeModal}>
              <Text className="font-semibold text-ink">Batal</Text>
            </Pressable>
            <Pressable
              className="rounded-xl bg-primary px-5 py-3"
              onPress={handleSave}
              disabled={saving}
            >
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

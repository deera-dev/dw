import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuthStore } from '../../auth/store/authStore';
import { useAccounts, useAddTransaction, useUpdateTransaction } from '../hooks/useFinance';
import { useTransactionFormStore } from '../store/transactionFormStore';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { showAlert } from '../../../shared/lib/confirm';
import { ACCOUNT_TYPE_LABEL, type AccountType } from '../lib/accountBalance';
import BottomSheetModal from '../../../shared/ui/BottomSheetModal';

export default function AddTransactionModal() {
  const session = useAuthStore((s) => s.session);
  const form = useTransactionFormStore();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: accounts = [] } = useAccounts();
  const [saving, setSaving] = useState(false);
  const { themeVars } = useThemeVars();
  const isEditing = Boolean(form.editingId);

  async function handleSave() {
    if (!session) return;
    if (!form.accountId) {
      showAlert('Pilih akun dulu', 'Setiap transaksi harus dicatat ke salah satu akun.');
      return;
    }
    setSaving(true);
    try {
      // amount dikirim mentah; validasi "harus > 0" ditegakkan check constraint di Postgres.
      const payload = {
        type: form.type,
        amount: Number(form.amount.replace(/[^0-9]/g, '')),
        category: form.category.trim() || 'Lainnya',
        description: form.description.trim() || null,
        account_id: form.accountId,
      };
      if (form.editingId) {
        await updateTransaction.mutateAsync({ id: form.editingId, patch: payload });
      } else {
        await addTransaction.mutateAsync({ recorded_by: session.user.id, ...payload });
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
            {isEditing ? 'Edit Transaksi' : 'Transaksi Baru'}
          </Text>

          <View className="mb-3 flex-row gap-2">
            <Pressable
              className={`flex-1 items-center rounded-xl border p-3 ${
                form.type === 'pengeluaran' ? 'border-primary bg-primary' : 'border-border'
              }`}
              onPress={() => form.setType('pengeluaran')}
            >
              <Text className={form.type === 'pengeluaran' ? 'font-semibold text-white' : 'text-ink'}>
                Pengeluaran
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 items-center rounded-xl border p-3 ${
                form.type === 'pemasukan' ? 'border-primary bg-primary' : 'border-border'
              }`}
              onPress={() => form.setType('pemasukan')}
            >
              <Text className={form.type === 'pemasukan' ? 'font-semibold text-white' : 'text-ink'}>
                Pemasukan
              </Text>
            </Pressable>
          </View>

          {accounts.length === 0 ? (
            <View className="mb-3 rounded-xl border border-danger/40 bg-danger/5 p-3">
              <Text className="text-xs text-danger">
                Belum ada akun. Tambah akun dulu (misal BCA, Cash) lewat tab "Akun" sebelum mencatat
                transaksi.
              </Text>
            </View>
          ) : (
            <>
              <Text className="mb-1.5 mt-1 text-xs text-muted">Akun</Text>
              <View className="mb-3 flex-row flex-wrap gap-2">
                {accounts.map((acc) => (
                  <Pressable
                    key={acc.id}
                    className={`shrink-0 rounded-full border px-3 py-2 ${
                      form.accountId === acc.id ? 'border-primary bg-primary' : 'border-border'
                    }`}
                    onPress={() => form.setAccountId(acc.id)}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-xs ${form.accountId === acc.id ? 'text-white' : 'text-ink'}`}
                    >
                      {acc.name} · {ACCOUNT_TYPE_LABEL[acc.type as AccountType]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Jumlah (Rp)"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={form.setAmount}
          />
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Kategori (misal: Makan, Transport)"
            value={form.category}
            onChangeText={form.setCategory}
          />
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Catatan (opsional)"
            value={form.description}
            onChangeText={form.setDescription}
          />

          <View className="mt-2 flex-row justify-end gap-3">
            <Pressable className="p-3" onPress={form.closeModal}>
              <Text className="font-semibold text-ink">Batal</Text>
            </Pressable>
            <Pressable
              className="rounded-xl bg-primary px-5 py-3"
              onPress={handleSave}
              disabled={saving || accounts.length === 0}
            >
              <Text className="font-semibold text-white">
                {saving ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan'}
              </Text>
            </Pressable>
          </View>
        </View>
    </BottomSheetModal>
  );
}

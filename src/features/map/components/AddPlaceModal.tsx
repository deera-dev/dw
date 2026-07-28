import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { showAlert } from '../../../shared/lib/confirm';
import { useAddSavedPlace } from '../hooks/useMap';
import { PLACE_CATEGORIES, type PlaceCategory } from '../constants';
import BottomSheetModal from '../../../shared/ui/BottomSheetModal';

// Koordinat pin baru diambil dari lokasi HP saat ini ketika modal dibuka —
// paling masuk akal untuk kasus "lagi di resto ini, mau disimpan" tanpa perlu
// UI pilih titik di peta secara manual (di luar scope MVP §4.13).
export default function AddPlaceModal({
  visible,
  onClose,
  userId,
}: {
  visible: boolean;
  onClose: () => void;
  userId: string;
}) {
  const { themeVars } = useThemeVars();
  const addPlace = useAddSavedPlace();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('resto_cafe');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setName('');
    setCategory('resto_cafe');
    setNotes('');
  }

  async function handleSave() {
    if (!name.trim()) {
      showAlert('Cek lagi', 'Isi nama tempatnya dulu.');
      return;
    }
    setSaving(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Izin lokasi ditolak', 'Aktifkan izin lokasi supaya posisi tempat ini bisa disimpan.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      await addPlace.mutateAsync({
        name: name.trim(),
        category,
        notes: notes.trim() || null,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        created_by: userId,
      });
      reset();
      onClose();
    } catch (e: any) {
      showAlert('Gagal menyimpan tempat', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
        <View style={themeVars} className="rounded-t-3xl bg-card p-5">
          <Text className="mb-4 font-title text-lg font-bold text-ink">Simpan Tempat Baru</Text>

          <TextInput
            style={{ color: '#EDEDED' }}
            placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Nama tempat (mis. Kopi Kenangan)"
            value={name}
            onChangeText={setName}
          />

          <Text className="mb-1.5 mt-1 text-xs text-muted">Kategori</Text>
          <View className="mb-2.5 flex-row flex-wrap gap-2">
            {PLACE_CATEGORIES.map((c) => (
              <Pressable
                key={c.value}
                className={`shrink-0 flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                  category === c.value ? 'border-primary bg-primary' : 'border-border'
                }`}
                onPress={() => setCategory(c.value)}
              >
                <Ionicons name={c.icon} size={13} color={category === c.value ? '#fff' : '#8A8D94'} />
                <Text numberOfLines={1} className={`text-xs ${category === c.value ? 'text-white' : 'text-ink'}`}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={{ color: '#EDEDED' }}
            placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-4 text-base text-ink"
            placeholder="Catatan (opsional, mis. menu favorit)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Text className="mb-3 text-[10px] text-subtle">
            Titik lokasi diambil dari posisi HP saat ini — pastikan kamu sedang di/dekat tempat ini saat menyimpan.
          </Text>

          <View className="mt-1 flex-row justify-end gap-3">
            <Pressable className="p-3" onPress={onClose}>
              <Text className="font-semibold text-ink">Batal</Text>
            </Pressable>
            <Pressable
              className="items-center rounded-xl bg-primary px-5 py-3"
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
            </Pressable>
          </View>
        </View>
    </BottomSheetModal>
  );
}

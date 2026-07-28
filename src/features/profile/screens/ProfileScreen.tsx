import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../../../shared/lib/confirm';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesList, useUpdateProfile } from '../../../shared/hooks/useProfiles';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import Card from '../../../shared/ui/Card';
import { exportAllDataAsJson } from '../../../shared/lib/dataExport';
import DatePickerField from '../../../shared/ui/DatePickerField';
import { formatMl, glassesToMl, WATER_GLASS_ML } from '../../../shared/lib/hydration';

function formatDateID(iso: string | null) {
  if (!iso) return 'Belum diisi';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ProfileEditor() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const updateProfile = useUpdateProfile();
  const { primary } = useThemeVars();

  const myProfile = profiles.find((p) => p.id === session?.user.id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(myProfile?.name ?? '');
  const [birthDate, setBirthDate] = useState(myProfile?.birth_date ?? '');
  const [marriageDate, setMarriageDate] = useState(myProfile?.marriage_date ?? '');
  const [gender, setGender] = useState<'pria' | 'wanita' | null>(
    (myProfile?.gender as 'pria' | 'wanita' | null) ?? null
  );
  const [saving, setSaving] = useState(false);

  if (!myProfile) return null;

  function startEditing() {
    setName(myProfile!.name ?? '');
    setBirthDate(myProfile!.birth_date ?? '');
    setMarriageDate(myProfile!.marriage_date ?? '');
    setGender((myProfile!.gender as 'pria' | 'wanita' | null) ?? null);
    setEditing(true);
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: session.user.id,
        patch: {
          name: name.trim() || myProfile!.name,
          birth_date: birthDate || null,
          marriage_date: marriageDate || null,
          gender,
        },
      });
      setEditing(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-ink">Profil</Text>
        <Pressable onPress={() => (editing ? setEditing(false) : startEditing())}>
          <Text className="text-xs font-semibold text-primary">{editing ? 'Batal' : 'Ubah'}</Text>
        </Pressable>
      </View>

      {editing ? (
        <View>
          <Text className="mb-1 text-xs text-muted">Nama</Text>
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
            value={name}
            onChangeText={setName}
          />
          <Text className="mb-1 text-xs text-muted">Tanggal lahir</Text>
          <View className="mb-3">
            <DatePickerField value={birthDate} onChange={setBirthDate} placeholder="Pilih tanggal lahir" />
          </View>
          <Text className="mb-1 text-xs text-muted">Tanggal pernikahan</Text>
          <View className="mb-3">
            <DatePickerField value={marriageDate} onChange={setMarriageDate} placeholder="Pilih tanggal nikah" />
          </View>
          <Text className="mb-1 text-xs text-muted">Jenis kelamin (buat personalisasi program olahraga)</Text>
          <View className="mb-3 flex-row gap-2">
            {(['pria', 'wanita'] as const).map((g) => (
              <Pressable
                key={g}
                className={`flex-1 items-center rounded-xl border p-2.5 ${
                  gender === g ? 'border-primary bg-primary' : 'border-border'
                }`}
                onPress={() => setGender(g)}
              >
                <Text className={`text-sm font-semibold ${gender === g ? 'text-white' : 'text-ink'}`}>
                  {g === 'pria' ? 'Pria' : 'Wanita'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleSave} disabled={saving}>
            <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-2.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person-outline" size={15} color={primary} />
            <Text className="text-sm capitalize text-ink">{myProfile.name}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={15} color={primary} />
            <Text className="text-sm text-ink">Lahir: {formatDateID(myProfile.birth_date)}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="heart-outline" size={15} color={primary} />
            <Text className="text-sm text-ink">Menikah: {formatDateID(myProfile.marriage_date)}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}

function NotificationPrefs() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const updateProfile = useUpdateProfile();
  const myProfile = profiles.find((p) => p.id === session?.user.id);

  if (!myProfile) return null;

  return (
    <Card className="mb-4">
      <Text className="mb-3 text-sm font-bold text-ink">Notifikasi</Text>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm text-ink">Pengingat mendesak</Text>
          <Text className="mt-0.5 text-[11px] text-muted">Obat, tagihan, kontrol dokter, dll.</Text>
        </View>
        <ToggleSwitch
          value={myProfile.notify_urgent}
          onValueChange={(v) =>
            updateProfile.mutate({ userId: myProfile.id, patch: { notify_urgent: v } })
          }
        />
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm text-ink">Ringkasan harian</Text>
          <Text className="mt-0.5 text-[11px] text-muted">Notifikasi pagi & malam.</Text>
        </View>
        <ToggleSwitch
          value={myProfile.notify_digest}
          onValueChange={(v) =>
            updateProfile.mutate({ userId: myProfile.id, patch: { notify_digest: v } })
          }
        />
      </View>
    </Card>
  );
}

function HealthTargetsEditor() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const updateProfile = useUpdateProfile();
  const myProfile = profiles.find((p) => p.id === session?.user.id);

  const [editing, setEditing] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(String(myProfile?.daily_water_target_glasses ?? 8));
  const [exerciseMinutes, setExerciseMinutes] = useState(
    String(myProfile?.weekly_exercise_target_minutes ?? 150)
  );
  const [saving, setSaving] = useState(false);

  if (!myProfile) return null;

  function startEditing() {
    setWaterGlasses(String(myProfile!.daily_water_target_glasses));
    setExerciseMinutes(String(myProfile!.weekly_exercise_target_minutes));
    setEditing(true);
  }

  async function handleSave() {
    if (!session) return;
    const glasses = Number(waterGlasses);
    const minutes = Number(exerciseMinutes);
    if (!glasses || glasses <= 0 || !minutes || minutes <= 0) {
      showAlert('Cek lagi', 'Isi target dengan angka yang benar.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: session.user.id,
        patch: {
          daily_water_target_glasses: glasses,
          weekly_exercise_target_minutes: minutes,
        },
      });
      setEditing(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-ink">Target Kesehatan</Text>
        <Pressable onPress={() => (editing ? setEditing(false) : startEditing())}>
          <Text className="text-xs font-semibold text-primary">{editing ? 'Batal' : 'Ubah'}</Text>
        </Pressable>
      </View>

      <Text className="mb-3 text-[11px] text-muted">
        Kebutuhan cairan & olahraga tiap orang beda-beda (berat badan, aktivitas, dll) — target ini cuma
        untukmu sendiri, pasangan bisa atur targetnya masing-masing.
      </Text>

      {editing ? (
        <View>
          <Text className="mb-1 text-xs text-muted">Target minum harian (gelas, 1 gelas = {WATER_GLASS_ML} ml)</Text>
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
            keyboardType="number-pad"
            value={waterGlasses}
            onChangeText={setWaterGlasses}
          />
          <Text className="mb-1 text-xs text-muted">Target olahraga mingguan (menit)</Text>
          <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
            className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
            keyboardType="number-pad"
            value={exerciseMinutes}
            onChangeText={setExerciseMinutes}
          />
          <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleSave} disabled={saving}>
            <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-2.5">
          <View className="flex-row items-center gap-2">
            <Ionicons name="water-outline" size={15} color="#9AA0A8" />
            <Text className="text-sm text-ink">
              Minum: {myProfile.daily_water_target_glasses} gelas/hari (
              {formatMl(glassesToMl(myProfile.daily_water_target_glasses))})
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="barbell-outline" size={15} color="#9AA0A8" />
            <Text className="text-sm text-ink">
              Olahraga: {myProfile.weekly_exercise_target_minutes} menit/minggu
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

function SmokingSettingsEditor() {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesList();
  const updateProfile = useUpdateProfile();
  const myProfile = profiles.find((p) => p.id === session?.user.id);

  const [editing, setEditing] = useState(false);
  const [packPrice, setPackPrice] = useState(String(myProfile?.cigarette_pack_price ?? 0));
  const [perPack, setPerPack] = useState(String(myProfile?.cigarettes_per_pack ?? 12));
  const [saving, setSaving] = useState(false);

  if (!myProfile) return null;

  function startEditing() {
    setPackPrice(String(myProfile!.cigarette_pack_price));
    setPerPack(String(myProfile!.cigarettes_per_pack));
    setEditing(true);
  }

  async function handleToggle(v: boolean) {
    if (!session) return;
    try {
      await updateProfile.mutateAsync({ userId: session.user.id, patch: { is_smoker: v } });
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    }
  }

  async function handleSave() {
    if (!session) return;
    const price = Number(packPrice);
    const count = Number(perPack);
    if (price < 0 || !count || count <= 0) {
      showAlert('Cek lagi', 'Isi harga & jumlah batang per bungkus dengan angka yang benar.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: session.user.id,
        patch: { cigarette_pack_price: price, cigarettes_per_pack: count },
      });
      setEditing(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-bold text-ink">Catatan Rokok</Text>
          <Text className="mt-0.5 text-[11px] text-muted">
            Aktifkan kalau kamu perokok, supaya bisa dicatat di modul Kesehatan.
          </Text>
        </View>
        <ToggleSwitch value={myProfile.is_smoker} onValueChange={handleToggle} />
      </View>

      {myProfile.is_smoker && (
        <View className="border-t border-border pt-3">
          {editing ? (
            <View>
              <Text className="mb-1 text-xs text-muted">Harga per bungkus (Rp)</Text>
              <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
                className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
                keyboardType="number-pad"
                value={packPrice}
                onChangeText={setPackPrice}
              />
              <Text className="mb-1 text-xs text-muted">Jumlah batang per bungkus</Text>
              <TextInput
        style={{ color: '#EDEDED' }}
        placeholderTextColor="#8A8D94"
                className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
                keyboardType="number-pad"
                value={perPack}
                onChangeText={setPerPack}
              />
              <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleSave} disabled={saving}>
                <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-ink">
                {myProfile.cigarette_pack_price > 0
                  ? `Rp${myProfile.cigarette_pack_price.toLocaleString('id-ID')} / bungkus (${
                      myProfile.cigarettes_per_pack
                    } batang)`
                  : 'Harga bungkus belum diisi'}
              </Text>
              <Pressable onPress={startEditing}>
                <Text className="text-xs font-semibold text-primary">Ubah</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

function DataExportButton() {
  const [exporting, setExporting] = useState(false);
  const { primary } = useThemeVars();

  async function handleExport() {
    setExporting(true);
    try {
      await exportAllDataAsJson();
    } catch (e: any) {
      showAlert('Gagal mengekspor', e.message ?? String(e));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Pressable
      className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border border-primary p-3.5"
      onPress={handleExport}
      disabled={exporting}
    >
      <Ionicons name="download-outline" size={16} color={primary} />
      <Text className="text-sm font-semibold text-primary">
        {exporting ? 'Menyiapkan...' : 'Ekspor Semua Data (JSON)'}
      </Text>
    </Pressable>
  );
}

export default function ProfileScreen({ showHeader = true }: { showHeader?: boolean } = {}) {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View className="flex-1 bg-surface">
      {showHeader && (
        <View className="px-4 pt-4">
          <ScreenHeader icon="person" title="Pengaturan & Profil" subtitle={session?.user.email ?? ''} />
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: showHeader ? 0 : 16, paddingBottom: 16 }}
      >
      <ProfileEditor />
      <HealthTargetsEditor />
      <SmokingSettingsEditor />
      <NotificationPrefs />
      <DataExportButton />

      <Pressable className="items-center rounded-xl bg-danger p-3.5" onPress={signOut}>
        <Text className="font-semibold text-white">Keluar</Text>
      </Pressable>
      </ScrollView>
    </View>
  );
}

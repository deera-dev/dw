import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import { Ionicons } from '@expo/vector-icons';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesMap } from '../../../shared/hooks/useProfiles';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import Card from '../../../shared/ui/Card';
import EmptyState from '../../../shared/ui/EmptyState';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';
import {
  usePregnancyProfile,
  useSavePregnancyProfile,
  usePregnancyChecklist,
  useAddChecklistItem,
  useAddChecklistItems,
  useToggleChecklistItem,
  useUpdateChecklistItemTitle,
  useDeleteChecklistItem,
  usePregnancyContacts,
  useAddPregnancyContact,
  useUpdatePregnancyContact,
  useDeletePregnancyContact,
} from '../hooks/usePregnancy';
import { PREGNANCY_CHECKLIST_TEMPLATE } from '../../../shared/lib/checklistTemplates';
import { computeCycleInfo, computePregnancyInfo, formatDateID } from '../lib/calculations';
import DatePickerField from '../../../shared/ui/DatePickerField';

function CycleTracker({ lastPeriodDate, cycleLengthDays }: { lastPeriodDate: string; cycleLengthDays: number }) {
  const info = computeCycleInfo(new Date(lastPeriodDate), cycleLengthDays);
  const { primary } = useThemeVars();
  return (
    <Card accent>
      <View className="mb-2 flex-row items-center gap-1.5">
        <Ionicons name="flower-outline" size={16} color={primary} />
        <Text className="text-sm font-bold text-primary">Hari ke-{info.cycleDay} siklus</Text>
      </View>
      <Text className="mb-1 text-sm text-ink">
        Perkiraan masa subur: <Text className="font-semibold text-ink">{formatDateID(info.fertileWindowStart)}</Text> —{' '}
        <Text className="font-semibold text-ink">{formatDateID(info.fertileWindowEnd)}</Text>
      </Text>
      <Text className="mb-1 text-sm text-ink">
        Perkiraan ovulasi: <Text className="font-semibold text-ink">{formatDateID(info.ovulationDate)}</Text>
      </Text>
      <Text className="text-sm text-ink">
        Periode berikutnya diperkirakan{' '}
        <Text className="font-semibold text-ink">
          {info.daysUntilNextPeriod >= 0 ? `${info.daysUntilNextPeriod} hari lagi` : 'segera'}
        </Text>{' '}
        ({formatDateID(info.nextPeriodDate)})
      </Text>
      <Text className="mt-3 text-[10px] italic text-subtle">
        Perkiraan berdasarkan rumus siklus umum — bisa berbeda dari kondisi aktual, bukan pengganti saran dokter.
      </Text>
    </Card>
  );
}

function PregnancyTracker({ pregnancyStartDate }: { pregnancyStartDate: string }) {
  const info = computePregnancyInfo(new Date(pregnancyStartDate));
  const { primary } = useThemeVars();
  return (
    <Card accent>
      <View className="mb-2 flex-row items-center gap-1.5">
        <Ionicons name="body-outline" size={16} color={primary} />
        <Text className="text-sm font-bold text-primary">
          Usia kehamilan: {info.weeksPregnant} minggu {info.daysIntoWeek} hari
        </Text>
      </View>
      <Text className="mb-1 text-sm text-ink">
        Trimester: <Text className="font-semibold text-ink">{info.trimester}</Text>
      </Text>
      <Text className="mb-1 text-sm text-ink">
        Perkiraan HPL: <Text className="font-semibold text-ink">{formatDateID(info.dueDate)}</Text>
      </Text>
      <Text className="text-sm text-ink">
        {info.daysUntilDue >= 0
          ? `${info.daysUntilDue} hari menuju HPL`
          : `${Math.abs(info.daysUntilDue)} hari melewati HPL`}
      </Text>
      <Text className="mt-3 text-[10px] italic text-subtle">
        Taksiran usia kehamilan pakai rumus Naegele (HPHT + 280 hari) — bukan pengganti pemeriksaan medis.
      </Text>
    </Card>
  );
}

function SettingsForm({
  profile,
  userId,
}: {
  profile: {
    id: string;
    is_enabled: boolean;
    tracking_mode: string;
    last_period_date: string | null;
    cycle_length_days: number;
    pregnancy_start_date: string | null;
  } | null;
  userId: string;
}) {
  const save = useSavePregnancyProfile();
  const [mode, setMode] = useState(profile?.tracking_mode ?? 'siklus');
  const [lastPeriod, setLastPeriod] = useState(profile?.last_period_date ?? '');
  const [cycleLength, setCycleLength] = useState(String(profile?.cycle_length_days ?? 28));
  const [pregnancyStart, setPregnancyStart] = useState(profile?.pregnancy_start_date ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (mode === 'siklus' && !lastPeriod) {
      showAlert('Cek lagi', 'Pilih tanggal HPHT dulu.');
      return;
    }
    if (mode === 'hamil' && !pregnancyStart) {
      showAlert('Cek lagi', 'Pilih tanggal HPHT/mulai kehamilan dulu.');
      return;
    }
    const cycleNum = Number(cycleLength) || 28;
    setSaving(true);
    try {
      await save.mutateAsync({
        userId,
        existingId: profile?.id ?? null,
        patch: {
          is_enabled: true,
          tracking_mode: mode,
          last_period_date: mode === 'siklus' ? lastPeriod : profile?.last_period_date ?? null,
          cycle_length_days: cycleNum,
          pregnancy_start_date: mode === 'hamil' ? pregnancyStart : profile?.pregnancy_start_date ?? null,
        },
      });
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <Text className="mb-3 text-sm font-bold text-ink">Pengaturan Pelacakan</Text>
      <SegmentedTabs
        value={mode}
        onChange={setMode}
        options={[
          { value: 'siklus', label: 'Masa Subur' },
          { value: 'hamil', label: 'Sedang Hamil' },
        ]}
      />
      <View className="mt-3">
        {mode === 'siklus' ? (
          <>
            <Text className="mb-1 text-xs text-muted">Tanggal HPHT</Text>
            <View className="mb-3">
              <DatePickerField value={lastPeriod} onChange={setLastPeriod} placeholder="Pilih tanggal HPHT" />
            </View>
            <Text className="mb-1 text-xs text-muted">Panjang siklus (hari)</Text>
            <TextInput
        style={{ color: '#EDEDED' }}
              className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
              keyboardType="number-pad"
              value={cycleLength}
              onChangeText={setCycleLength}
            />
          </>
        ) : (
          <>
            <Text className="mb-1 text-xs text-muted">Tanggal HPHT / mulai kehamilan</Text>
            <View className="mb-3">
              <DatePickerField
                value={pregnancyStart}
                onChange={setPregnancyStart}
                placeholder="Pilih tanggal mulai kehamilan"
              />
            </View>
          </>
        )}
        <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleSave} disabled={saving}>
          <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function ChecklistSection({ userId }: { userId: string }) {
  const { data: items = [] } = usePregnancyChecklist();
  const addItem = useAddChecklistItem();
  const addItems = useAddChecklistItems();
  const toggleItem = useToggleChecklistItem();
  const updateItemTitle = useUpdateChecklistItemTitle();
  const deleteItem = useDeleteChecklistItem();
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  async function handleAdd() {
    if (!title.trim()) return;
    await addItem.mutateAsync({ userId, title: title.trim() });
    setTitle('');
  }

  async function handleAddTemplate() {
    const existing = new Set(items.map((i) => i.title.trim().toLowerCase()));
    const toAdd = PREGNANCY_CHECKLIST_TEMPLATE.filter((t) => !existing.has(t.toLowerCase()));
    if (toAdd.length === 0) {
      showAlert('Sudah lengkap', 'Semua item template sudah ada di checklist.');
      return;
    }
    await addItems.mutateAsync({ userId, titles: toAdd });
  }

  function handleDelete(id: string, t: string) {
    confirmAction({
      title: 'Hapus item checklist?',
      message: t,
      onConfirm: () => deleteItem.mutate(id),
    });
  }

  async function handleSaveEdit() {
    if (!editingId || !editingTitle.trim()) return;
    await updateItemTitle.mutateAsync({ id: editingId, title: editingTitle.trim() });
    setEditingId(null);
  }

  return (
    <Card className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-ink">Checklist Persiapan</Text>
        <Pressable onPress={handleAddTemplate}>
          <Text className="text-xs font-semibold text-primary">+ Dari template</Text>
        </Pressable>
      </View>
      {items.length === 0 && (
        <EmptyState icon="checkbox-outline" text="Belum ada item — tambahkan hal yang perlu disiapkan." />
      )}
      {items.map((item) =>
        editingId === item.id ? (
          <View key={item.id} className="flex-row items-center gap-2 border-b border-border py-2">
            <TextInput
        style={{ color: '#EDEDED' }}
              className="flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink"
              value={editingTitle}
              onChangeText={setEditingTitle}
              autoFocus
            />
            <Pressable onPress={handleSaveEdit}>
              <Text className="text-xs font-semibold text-primary">Simpan</Text>
            </Pressable>
            <Pressable onPress={() => setEditingId(null)}>
              <Text className="text-xs text-muted">Batal</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            key={item.id}
            className="flex-row items-center justify-between border-b border-border py-2.5"
            onPress={() => toggleItem.mutate({ id: item.id, isDone: !item.is_done })}
          >
            <View className="flex-1 flex-row items-center gap-2">
              <Ionicons
                name={item.is_done ? 'checkbox' : 'square-outline'}
                size={18}
                color={item.is_done ? '#6FCB74' : '#8A8D94'}
              />
              <Text className={`flex-1 text-sm ${item.is_done ? 'text-subtle line-through' : 'text-ink'}`}>
                {item.title}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Pressable
                className="p-1.5"
                onPress={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
              >
                <Ionicons name="pencil-outline" size={14} color="#8A8D94" />
              </Pressable>
              <Pressable hitSlop={10} className="p-1.5" onPress={() => handleDelete(item.id, item.title)}>
                <Ionicons name="trash-outline" size={14} color="#E5766D" />
              </Pressable>
            </View>
          </Pressable>
        )
      )}
      <View className="mt-3 flex-row gap-2">
        <TextInput
        style={{ color: '#EDEDED' }}
          className="flex-1 rounded-xl border border-border p-3 text-sm text-ink"
          placeholder="Tambah item (mis. Siapkan tas rumah sakit)"
          value={title}
          onChangeText={setTitle}
        />
        <Pressable className="items-center justify-center rounded-xl bg-primary px-4" onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </Card>
  );
}

function EmergencyContactsSection({ userId }: { userId: string }) {
  const { data: contacts = [] } = usePregnancyContacts();
  const addContact = useAddPregnancyContact();
  const updateContact = useUpdatePregnancyContact();
  const deleteContact = useDeletePregnancyContact();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');

  async function handleAdd() {
    if (!name.trim() || !phone.trim()) return;
    await addContact.mutateAsync({ userId, name: name.trim(), phone: phone.trim(), role: role.trim() || null });
    setName('');
    setRole('');
    setPhone('');
  }

  function handleDelete(id: string, n: string) {
    confirmAction({
      title: 'Hapus kontak?',
      message: n,
      onConfirm: () => deleteContact.mutate(id),
    });
  }

  function openEdit(c: { id: string; name: string; role: string | null; phone: string }) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditRole(c.role ?? '');
    setEditPhone(c.phone);
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim() || !editPhone.trim()) return;
    await updateContact.mutateAsync({
      id: editingId,
      patch: { name: editName.trim(), phone: editPhone.trim(), role: editRole.trim() || null },
    });
    setEditingId(null);
  }

  return (
    <Card className="mb-4">
      <Text className="mb-3 text-sm font-bold text-ink">Kontak Darurat</Text>
      {contacts.length === 0 && (
        <EmptyState icon="call-outline" text="Belum ada — tambahkan dokter/bidan/rumah sakit terdekat." />
      )}
      {contacts.map((c) =>
        editingId === c.id ? (
          <View key={c.id} className="gap-2 border-b border-border py-2.5">
            <TextInput
        style={{ color: '#EDEDED' }}
              className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink"
              placeholder="Nama"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
        style={{ color: '#EDEDED' }}
              className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink"
              placeholder="Peran (opsional)"
              value={editRole}
              onChangeText={setEditRole}
            />
            <TextInput
        style={{ color: '#EDEDED' }}
              className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink"
              placeholder="Nomor telepon"
              keyboardType="phone-pad"
              value={editPhone}
              onChangeText={setEditPhone}
            />
            <View className="flex-row gap-3">
              <Pressable onPress={handleSaveEdit}>
                <Text className="text-xs font-semibold text-primary">Simpan</Text>
              </Pressable>
              <Pressable onPress={() => setEditingId(null)}>
                <Text className="text-xs text-muted">Batal</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            key={c.id}
            onPress={() => openEdit(c)}
            className="flex-row items-center justify-between border-b border-border py-2.5"
          >
            <View>
              <Text className="text-sm font-medium text-ink">{c.name}{c.role ? ` · ${c.role}` : ''}</Text>
              <Text className="mt-0.5 text-[11px] text-muted">{c.phone}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-[10px] text-subtle">ketuk untuk edit</Text>
              <Pressable hitSlop={10} className="p-1" onPress={() => handleDelete(c.id, c.name)}>
                <Ionicons name="trash-outline" size={14} color="#E5766D" />
              </Pressable>
            </View>
          </Pressable>
        )
      )}
      <View className="mt-3 gap-2">
        <TextInput
        style={{ color: '#EDEDED' }}
          className="rounded-xl border border-border p-3 text-sm text-ink"
          placeholder="Nama (mis. dr. Aisyah)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
        style={{ color: '#EDEDED' }}
          className="rounded-xl border border-border p-3 text-sm text-ink"
          placeholder="Peran (opsional, mis. Dokter Kandungan)"
          value={role}
          onChangeText={setRole}
        />
        <TextInput
        style={{ color: '#EDEDED' }}
          className="rounded-xl border border-border p-3 text-sm text-ink"
          placeholder="Nomor telepon"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleAdd}>
          <Text className="font-semibold text-white">Tambah Kontak</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function PregnancyScreen({ showHeader = true }: { showHeader?: boolean } = {}) {
  const session = useAuthStore((s) => s.session);
  const profiles = useProfilesMap();
  const { data: profile } = usePregnancyProfile();
  const save = useSavePregnancyProfile();
  const userId = session?.user.id ?? '';

  async function handleToggleEnabled(next: boolean) {
    try {
      await save.mutateAsync({
        userId,
        existingId: profile?.id ?? null,
        patch: { is_enabled: next },
      });
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    }
  }

  return (
    <View className="flex-1 bg-surface">
      {showHeader && (
        <View className="px-4 pt-4">
          <ScreenHeader
            icon="flower"
            title="Rencana Kehamilan"
            subtitle="Pelacakan masa subur atau usia kehamilan, berdua"
          />
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: showHeader ? 0 : 16, paddingBottom: 16 }}
      >
      <Card className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-bold text-ink">Aktifkan fitur ini</Text>
          <Text className="mt-0.5 text-[11px] text-muted">
            Data dilihat berdua {profile?.updated_by ? `· terakhir diubah ${profiles[profile.updated_by] ?? ''}` : ''}
          </Text>
        </View>
        <ToggleSwitch value={profile?.is_enabled ?? false} onValueChange={handleToggleEnabled} />
      </Card>

      {profile?.is_enabled ? (
        <>
          {profile.tracking_mode === 'siklus' && profile.last_period_date && (
            <View className="mb-4">
              <CycleTracker
                lastPeriodDate={profile.last_period_date}
                cycleLengthDays={profile.cycle_length_days}
              />
            </View>
          )}
          {profile.tracking_mode === 'hamil' && profile.pregnancy_start_date && (
            <View className="mb-4">
              <PregnancyTracker pregnancyStartDate={profile.pregnancy_start_date} />
            </View>
          )}

          <SettingsForm profile={profile} userId={userId} />
          <ChecklistSection userId={userId} />
          <EmergencyContactsSection userId={userId} />
        </>
      ) : (
        <Card>
          <EmptyState
            icon="flower-outline"
            text="Fitur ini nonaktif. Aktifkan di atas untuk mulai melacak masa subur atau kehamilan berdua."
          />
        </Card>
      )}
      </ScrollView>
    </View>
  );
}

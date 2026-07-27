import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { confirmAction, showAlert } from '../../../shared/lib/confirm';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfilesMap } from '../../../shared/hooks/useProfiles';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import Card from '../../../shared/ui/Card';
import EmptyState from '../../../shared/ui/EmptyState';
import { useAddTransaction, useDeleteTransaction } from '../../finance/hooks/useFinance';
import {
  useTravelPlans,
  useAddTravelPlan,
  useUpdateTravelPlan,
  useDeleteTravelPlan,
  useTravelWishlist,
  useAddWishlistPlace,
  useUpdateWishlistPlace,
  useDeleteWishlistPlace,
  useTravelChecklist,
  useAddTravelChecklistItem,
  useAddTravelChecklistItems,
  useToggleTravelChecklistItem,
  useUpdateTravelChecklistItemTitle,
  useDeleteTravelChecklistItem,
} from '../hooks/useTravel';
import type { Tables } from '../../../shared/types/database';
import DatePickerField from '../../../shared/ui/DatePickerField';
import { TRAVEL_CHECKLIST_TEMPLATE } from '../../../shared/lib/checklistTemplates';

const QUALITY_TIME_THRESHOLD_DAYS = 60;

type TravelPlan = Tables<'travel_plans'>;

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatDateID(iso: string | null) {
  if (!iso) return 'Tanggal belum ditentukan';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_LABEL: Record<string, string> = { rencana: 'Rencana', selesai: 'Selesai', batal: 'Batal' };
const STATUS_BADGE: Record<string, string> = {
  rencana: 'bg-primary-soft text-primary-dark',
  selesai: 'bg-success/10 text-success',
  batal: 'bg-danger/10 text-danger',
};

// Pengingat "waktunya quality time" (§4.8) — dihitung dari rencana jalan-jalan
// terbaru; kalau sudah lama tidak ada agenda berdua, tampilkan banner ajakan.
function QualityTimeBanner({ plans }: { plans: TravelPlan[] }) {
  const { primary } = useThemeVars();
  if (plans.length === 0) {
    return (
      <Card className="mb-4 flex-row items-center gap-3">
        <Ionicons name="heart-outline" size={20} color={primary} />
        <Text className="flex-1 text-sm text-ink">
          Belum ada rencana jalan-jalan/date tercatat. Yuk rencanakan waktu berdua!
        </Text>
      </Card>
    );
  }
  const mostRecent = [...plans].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  const daysSince = Math.floor((Date.now() - new Date(mostRecent.created_at).getTime()) / (24 * 60 * 60 * 1000));
  if (daysSince < QUALITY_TIME_THRESHOLD_DAYS) return null;

  return (
    <Card className="mb-4 flex-row items-center gap-3">
      <Ionicons name="heart-outline" size={20} color={primary} />
      <Text className="flex-1 text-sm text-ink">
        Sudah {daysSince} hari sejak agenda berdua terakhir dicatat — waktunya quality time lagi?
      </Text>
    </Card>
  );
}

function TravelChecklistSection({ plan, userId }: { plan: TravelPlan; userId: string }) {
  const { data: items = [] } = useTravelChecklist(plan.id);
  const addItem = useAddTravelChecklistItem(plan.id);
  const addItems = useAddTravelChecklistItems(plan.id);
  const toggleItem = useToggleTravelChecklistItem(plan.id);
  const updateItemTitle = useUpdateTravelChecklistItemTitle(plan.id);
  const deleteItem = useDeleteTravelChecklistItem(plan.id);
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
    const toAdd = TRAVEL_CHECKLIST_TEMPLATE.filter((t) => !existing.has(t.toLowerCase()));
    if (toAdd.length === 0) {
      showAlert('Sudah lengkap', 'Semua item template sudah ada di checklist.');
      return;
    }
    await addItems.mutateAsync({ userId, titles: toAdd });
  }

  async function handleSaveEdit() {
    if (!editingId || !editingTitle.trim()) return;
    await updateItemTitle.mutateAsync({ id: editingId, title: editingTitle.trim() });
    setEditingId(null);
  }

  return (
    <View className="mt-3 border-t border-border pt-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-muted">Checklist Persiapan</Text>
        <Pressable onPress={handleAddTemplate}>
          <Text className="text-xs font-semibold text-primary">+ Dari template</Text>
        </Pressable>
      </View>
      {items.length === 0 && <Text className="mb-2 text-xs italic text-subtle">Belum ada item.</Text>}
      {items.map((item) =>
        editingId === item.id ? (
          <View key={item.id} className="flex-row items-center gap-2 py-1.5">
            <TextInput
        style={{ color: '#EDEDED' }}
              className="flex-1 rounded-lg border border-border px-2 py-1 text-sm text-ink"
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
            className="flex-row items-center justify-between py-1.5"
            onPress={() => toggleItem.mutate({ id: item.id, isDone: !item.is_done })}
          >
            <View className="flex-1 flex-row items-center gap-2">
              <Ionicons
                name={item.is_done ? 'checkbox' : 'square-outline'}
                size={16}
                color={item.is_done ? '#6FCB74' : '#8A8D94'}
              />
              <Text className={`flex-1 text-sm ${item.is_done ? 'text-subtle line-through' : 'text-ink'}`}>
                {item.title}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Pressable
                className="p-1"
                onPress={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
              >
                <Ionicons name="pencil-outline" size={13} color="#8A8D94" />
              </Pressable>
              <Pressable hitSlop={10} className="p-1" onPress={() => deleteItem.mutate(item.id)}>
                <Ionicons name="trash-outline" size={13} color="#E5766D" />
              </Pressable>
            </View>
          </Pressable>
        )
      )}
      <View className="mt-2 flex-row gap-2">
        <TextInput
        style={{ color: '#EDEDED' }}
          className="flex-1 rounded-xl border border-border p-2.5 text-sm text-ink"
          placeholder="Tambah item persiapan"
          value={title}
          onChangeText={setTitle}
        />
        <Pressable className="items-center justify-center rounded-xl bg-primary px-3" onPress={handleAdd}>
          <Ionicons name="add" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

function TravelPlanCard({ plan, userId }: { plan: TravelPlan; userId: string }) {
  const profiles = useProfilesMap();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDestination, setEditDestination] = useState(plan.destination);
  const [editDate, setEditDate] = useState(plan.planned_date ?? '');
  const [editBudget, setEditBudget] = useState(plan.budget != null ? String(plan.budget) : '');
  const updatePlan = useUpdateTravelPlan();
  const deletePlan = useDeleteTravelPlan();
  const addTransaction = useAddTransaction();
  const deleteTransaction = useDeleteTransaction();
  const { primary } = useThemeVars();

  function handleDelete() {
    confirmAction({
      title: 'Hapus rencana ini?',
      message: plan.destination,
      onConfirm: () => deletePlan.mutate(plan.id),
    });
  }

  // Budget jalan-jalan otomatis tersambung ke Keuangan: begitu status
  // berubah jadi "Selesai" dan ada anggarannya, langsung dicatat sebagai
  // pengeluaran kategori "Jalan-Jalan" — tidak perlu tombol manual lagi.
  // Kalau status dibatalkan/dikembalikan ke rencana, transaksi otomatis
  // tadi ikut dihapus supaya tidak ada catatan pengeluaran yang nyasar.
  async function cycleStatus() {
    const next = plan.status === 'rencana' ? 'selesai' : plan.status === 'selesai' ? 'batal' : 'rencana';
    try {
      if (next === 'selesai' && plan.budget && !plan.expense_transaction_id) {
        const tx = await addTransaction.mutateAsync({
          recorded_by: userId,
          type: 'pengeluaran',
          amount: plan.budget,
          category: 'Jalan-Jalan',
          description: plan.destination,
        });
        await updatePlan.mutateAsync({ id: plan.id, patch: { status: next, expense_transaction_id: tx.id } });
      } else if (next !== 'selesai' && plan.expense_transaction_id) {
        await deleteTransaction.mutateAsync(plan.expense_transaction_id);
        await updatePlan.mutateAsync({ id: plan.id, patch: { status: next, expense_transaction_id: null } });
      } else {
        await updatePlan.mutateAsync({ id: plan.id, patch: { status: next } });
      }
    } catch (e: any) {
      showAlert('Gagal memperbarui status', e.message ?? String(e));
    }
  }

  function startEdit() {
    setEditDestination(plan.destination);
    setEditDate(plan.planned_date ?? '');
    setEditBudget(plan.budget != null ? String(plan.budget) : '');
    setEditing(true);
    setExpanded(true);
  }

  async function handleSaveEdit() {
    if (!editDestination.trim()) {
      showAlert('Cek lagi', 'Destinasi tidak boleh kosong.');
      return;
    }
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        patch: {
          destination: editDestination.trim(),
          planned_date: editDate || null,
          budget: editBudget ? Number(editBudget.replace(/[^0-9]/g, '')) : null,
        },
      });
      setEditing(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    }
  }

  return (
    <Card className="mb-3">
      <Pressable onPress={() => setExpanded((v) => !v)}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-bold text-ink">{plan.destination}</Text>
            <Text className="mt-0.5 text-xs text-muted">{formatDateID(plan.planned_date)}</Text>
            {plan.budget != null && (
              <Text className="mt-0.5 text-xs text-muted">Anggaran: {formatRupiah(plan.budget)}</Text>
            )}
            <Text className="mt-0.5 text-[10px] text-subtle">
              dicatat {profiles[plan.created_by] ?? '—'} · ketuk untuk detail
            </Text>
          </View>
          <View className="items-end gap-1.5">
            <Pressable onPress={cycleStatus}>
              <Text className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_BADGE[plan.status]}`}>
                {STATUS_LABEL[plan.status]}
              </Text>
            </Pressable>
            <Pressable hitSlop={10} className="p-1" onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color="#E5766D" />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {expanded && (
        <>
          {editing ? (
            <View className="mt-3 border-t border-border pt-3">
              <TextInput
        style={{ color: '#EDEDED' }}
                className="mb-2.5 rounded-xl border border-border p-3 text-sm text-ink"
                placeholder="Destinasi"
                value={editDestination}
                onChangeText={setEditDestination}
              />
              <View className="mb-2.5">
                <DatePickerField value={editDate} onChange={setEditDate} placeholder="Tanggal rencana (opsional)" />
              </View>
              <TextInput
        style={{ color: '#EDEDED' }}
                className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
                placeholder="Anggaran (Rp, opsional)"
                keyboardType="numeric"
                value={editBudget}
                onChangeText={setEditBudget}
              />
              <View className="flex-row gap-2">
                <Pressable className="flex-1 items-center rounded-xl bg-primary p-2.5" onPress={handleSaveEdit}>
                  <Text className="font-semibold text-white">Simpan</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-xl border border-border p-2.5"
                  onPress={() => setEditing(false)}
                >
                  <Text className="font-semibold text-ink">Batal</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-border p-2.5"
              onPress={startEdit}
            >
              <Ionicons name="pencil-outline" size={14} color="#9AA0A8" />
              <Text className="text-xs font-semibold text-ink">Edit Rencana</Text>
            </Pressable>
          )}

          {plan.expense_transaction_id && (
            <View className="mt-2 flex-row items-center justify-center gap-1.5 rounded-xl bg-success/10 p-2.5">
              <Ionicons name="checkmark-circle-outline" size={14} color="#6FCB74" />
              <Text className="text-xs font-semibold text-success">
                Sudah tercatat otomatis di Keuangan ({formatRupiah(plan.budget ?? 0)})
              </Text>
            </View>
          )}
          {plan.budget != null && plan.status !== 'selesai' && !plan.expense_transaction_id && (
            <View className="mt-2 flex-row items-center justify-center gap-1.5 rounded-xl border border-primary p-2.5">
              <Ionicons name="wallet-outline" size={14} color={primary} />
              <Text className="text-xs font-semibold text-primary">
                Akan otomatis tercatat di Keuangan saat status "Selesai"
              </Text>
            </View>
          )}
          <TravelChecklistSection plan={plan} userId={userId} />
        </>
      )}
    </Card>
  );
}

function AddTravelPlanForm({ userId }: { userId: string }) {
  const addPlan = useAddTravelPlan();
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!destination.trim()) {
      showAlert('Cek lagi', 'Isi destinasi dulu.');
      return;
    }
    setSaving(true);
    try {
      await addPlan.mutateAsync({
        userId,
        destination: destination.trim(),
        plannedDate: plannedDate || null,
        budget: budget ? Number(budget.replace(/[^0-9]/g, '')) : null,
      });
      setDestination('');
      setPlannedDate('');
      setBudget('');
      setShowForm(false);
    } catch (e: any) {
      showAlert('Gagal menyimpan', e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <Pressable className="flex-row items-center justify-between" onPress={() => setShowForm((v) => !v)}>
        <Text className="text-sm font-bold text-ink">Rencana Baru</Text>
        <Text className="text-xs font-semibold text-primary">{showForm ? 'Batal' : '+ Tambah'}</Text>
      </Pressable>
      {showForm && (
        <View className="mt-3">
          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-2.5 rounded-xl border border-border p-3 text-sm text-ink"
            placeholder="Destinasi (mis. Bandung)"
            value={destination}
            onChangeText={setDestination}
          />
          <View className="mb-2.5">
            <DatePickerField
              value={plannedDate}
              onChange={setPlannedDate}
              placeholder="Tanggal rencana (opsional)"
            />
          </View>
          <TextInput
        style={{ color: '#EDEDED' }}
            className="mb-3 rounded-xl border border-border p-3 text-sm text-ink"
            placeholder="Anggaran (Rp, opsional)"
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
          <Pressable className="items-center rounded-xl bg-primary p-3" onPress={handleAdd} disabled={saving}>
            <Text className="font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

function WishlistSection({ userId }: { userId: string }) {
  const { data: places = [] } = useTravelWishlist();
  const addPlace = useAddWishlistPlace();
  const updatePlace = useUpdateWishlistPlace();
  const deletePlace = useDeleteWishlistPlace();
  const [placeName, setPlaceName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function handleAdd() {
    if (!placeName.trim()) return;
    await addPlace.mutateAsync({ userId, placeName: placeName.trim(), notes: null });
    setPlaceName('');
  }

  function handleDelete(id: string, name: string) {
    confirmAction({
      title: 'Hapus dari wishlist?',
      message: name,
      onConfirm: () => deletePlace.mutate(id),
    });
  }

  async function handleSaveEdit() {
    if (!editingId || !editingName.trim()) return;
    await updatePlace.mutateAsync({ id: editingId, patch: { place_name: editingName.trim() } });
    setEditingId(null);
  }

  return (
    <Card className="mb-4">
      <Text className="mb-3 text-sm font-bold text-ink">Wishlist Tempat</Text>
      {places.length === 0 && (
        <EmptyState icon="star-outline" text="Belum ada — tambahkan tempat yang ingin dikunjungi berdua." />
      )}
      {places.map((p) =>
        editingId === p.id ? (
          <View key={p.id} className="flex-row items-center gap-2 border-b border-border py-2">
            <TextInput
        style={{ color: '#EDEDED' }}
              className="flex-1 rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink"
              value={editingName}
              onChangeText={setEditingName}
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
          key={p.id}
          onPress={() => {
            setEditingId(p.id);
            setEditingName(p.place_name);
          }}
          className="flex-row items-center justify-between border-b border-border py-2"
        >
          <Text className="text-sm text-ink">{p.place_name}</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-[10px] text-subtle">ketuk untuk edit</Text>
            <Pressable hitSlop={10} className="p-1" onPress={() => handleDelete(p.id, p.place_name)}>
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
          placeholder="Tambah tempat (mis. Raja Ampat)"
          value={placeName}
          onChangeText={setPlaceName}
        />
        <Pressable className="items-center justify-center rounded-xl bg-primary px-4" onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </Card>
  );
}

export default function TravelScreen() {
  const session = useAuthStore((s) => s.session);
  const { data: plans = [] } = useTravelPlans();
  const userId = session?.user.id ?? '';

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="airplane" title="Jalan-Jalan & Quality Time" subtitle="Rencana & wishlist berdua" />
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <QualityTimeBanner plans={plans} />
      <AddTravelPlanForm userId={userId} />

      {plans.length === 0 ? (
        <Card className="mb-4">
          <EmptyState icon="airplane-outline" text="Belum ada rencana jalan-jalan." />
        </Card>
      ) : (
        plans.map((plan) => <TravelPlanCard key={plan.id} plan={plan} userId={userId} />)
      )}

      <WishlistSection userId={userId} />
      </ScrollView>
    </View>
  );
}

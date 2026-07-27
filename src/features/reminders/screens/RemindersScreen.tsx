import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAllReminders, useDeactivateReminder, useUpcomingReminders } from '../hooks/useReminders';
import { useReminderFormStore } from '../store/reminderFormStore';
import AddReminderModal from '../components/AddReminderModal';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import Fab from '../../../shared/ui/Fab';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { confirmAction } from '../../../shared/lib/confirm';
import { REMINDER_CATEGORY_LABEL, REMINDER_RECURRENCE_LABEL } from '../categoryLabels';

type Tab = 'aktif' | 'mendatang';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  obat: 'medkit-outline',
  tagihan: 'cash-outline',
  tanggal_penting: 'gift-outline',
  cek_kesehatan: 'heart-outline',
  kontrol_dokter: 'medical-outline',
  umum: 'notifications-outline',
};

function formatOccursAt(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RemindersScreen({ showHeader = true }: { showHeader?: boolean } = {}) {
  const [tab, setTab] = useState<Tab>('aktif');
  const { data: reminders = [] } = useAllReminders();
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingReminders(7);
  const openModal = useReminderFormStore((s) => s.openModal);
  const openEditModal = useReminderFormStore((s) => s.openEditModal);
  const deactivateReminder = useDeactivateReminder();
  const { primary } = useThemeVars();

  function handleDeactivate(id: string, title: string) {
    confirmAction({
      title: 'Nonaktifkan pengingat?',
      message: title,
      confirmLabel: 'Nonaktifkan',
      onConfirm: () => deactivateReminder.mutate(id),
    });
  }

  return (
    <View className="flex-1 bg-surface">
      {showHeader && (
        <View className="px-4 pt-4">
          <ScreenHeader icon="notifications" title="Pengingat" subtitle="Obat, tagihan, tanggal penting" />
        </View>
      )}

      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        options={[
          { value: 'aktif', label: 'Semua Aktif' },
          { value: 'mendatang', label: '7 Hari' },
        ]}
      />

      {tab === 'aktif' ? (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openEditModal(item)}
              className="mb-2.5 flex-row items-center gap-3 rounded-xl bg-card p-3.5"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                <Ionicons name={CATEGORY_ICONS[item.category] ?? 'notifications-outline'} size={16} color={primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink">{item.title}</Text>
                <Text className="mt-0.5 text-xs text-muted">
                  {REMINDER_CATEGORY_LABEL[item.category]} · {REMINDER_RECURRENCE_LABEL[item.recurrence]}
                  {item.daily_times && item.daily_times.length > 0 ? ` (${item.daily_times.join(', ')})` : ''}
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => handleDeactivate(item.id, item.title)}
                className="p-1.5"
              >
                <Ionicons name="close-circle-outline" size={18} color="#9AA0A8" />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState icon="notifications-outline" text="Belum ada pengingat." />}
        />
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(item, idx) => `${item.reminder_id}-${item.occurs_at}-${idx}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="mb-2.5 rounded-xl bg-card p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-semibold text-ink">{item.title}</Text>
                {item.is_urgent && (
                  <Text className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                    Mendesak
                  </Text>
                )}
              </View>
              <Text className="mt-1 text-xs text-muted">{formatOccursAt(item.occurs_at)}</Text>
              <Text className="mt-0.5 text-xs text-subtle">{REMINDER_CATEGORY_LABEL[item.category]}</Text>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              text={upcomingLoading ? 'Memuat...' : 'Tidak ada pengingat dalam 7 hari ke depan.'}
            />
          }
        />
      )}

      <Fab onPress={openModal} />

      <AddReminderModal />
    </View>
  );
}

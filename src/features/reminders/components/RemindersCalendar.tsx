import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeVars } from '../../../shared/theme/useThemeVars';
import { useRemindersInRange } from '../hooks/useReminders';
import EmptyState from '../../../shared/ui/EmptyState';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';

const WEEKDAY_LABELS = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

type ViewMode = 'harian' | 'mingguan' | 'bulanan';

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatOccursAt(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  return start;
}

function ReminderList({
  reminders,
  emptyText,
}: {
  reminders: { reminder_id: string; title: string; occurs_at: string }[];
  emptyText: string;
}) {
  if (reminders.length === 0) return <EmptyState icon="calendar-outline" text={emptyText} />;
  return (
    <>
      {reminders.map((r, idx) => (
        <View key={`${r.reminder_id}-${idx}`} className="flex-row justify-between border-b border-border py-2">
          <Text className="text-sm font-medium text-ink">{r.title}</Text>
          <Text className="text-xs text-muted">{formatOccursAt(r.occurs_at)}</Text>
        </View>
      ))}
    </>
  );
}

// Kalender buatan sendiri (tanpa library eksternal), sekarang dengan 3 mode
// tampilan — Harian, Mingguan, Bulanan — biar bisa fokus lihat jadwal hari
// ini/minggu ini tanpa harus scroll grid bulan penuh.
export default function RemindersCalendar() {
  const [mode, setMode] = useState<ViewMode>('bulanan');
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [viewDay, setViewDay] = useState(() => new Date());
  const [viewWeekStart, setViewWeekStart] = useState(() => startOfWeek(new Date()));
  const { primary } = useThemeVars();

  const { fromISO, toISO } = useMemo(() => {
    const from = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const to = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, [viewMonth]);

  const { fromISO: dayFromISO, toISO: dayToISO } = useMemo(() => {
    const from = new Date(viewDay.getFullYear(), viewDay.getMonth(), viewDay.getDate());
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, [viewDay]);

  const { fromISO: weekFromISO, toISO: weekToISO } = useMemo(() => {
    const from = viewWeekStart;
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, [viewWeekStart]);

  const { data: monthReminders = [] } = useRemindersInRange(fromISO, toISO);
  const { data: dayReminders = [] } = useRemindersInRange(dayFromISO, dayToISO, mode === 'harian');
  const { data: weekReminders = [] } = useRemindersInRange(weekFromISO, weekToISO, mode === 'mingguan');

  const remindersByDate = useMemo(() => {
    const map = new Map<string, typeof monthReminders>();
    monthReminders.forEach((r) => {
      const key = toDateKey(new Date(r.occurs_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [monthReminders]);

  const weekRemindersByDate = useMemo(() => {
    const map = new Map<string, typeof weekReminders>();
    weekReminders.forEach((r) => {
      const key = toDateKey(new Date(r.occurs_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [weekReminders]);

  const gridDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewMonth]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(viewWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [viewWeekStart]);

  const monthLabel = viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const todayKey = toDateKey(new Date());
  const selectedReminders = remindersByDate.get(selectedKey) ?? [];

  function changeMonth(delta: number) {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  function changeDay(delta: number) {
    setViewDay((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  function changeWeek(delta: number) {
    setViewWeekStart((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  }

  const weekRangeLabel = useMemo(() => {
    const end = new Date(viewWeekStart);
    end.setDate(end.getDate() + 6);
    const sameMonth = viewWeekStart.getMonth() === end.getMonth();
    const startLabel = viewWeekStart.toLocaleDateString('id-ID', { day: 'numeric', month: sameMonth ? undefined : 'short' });
    const endLabel = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }, [viewWeekStart]);

  return (
    <View className="px-4 pb-4">
      <SegmentedTabs
        value={mode}
        onChange={(v) => setMode(v as ViewMode)}
        options={[
          { value: 'harian', label: 'Harian' },
          { value: 'mingguan', label: 'Mingguan' },
          { value: 'bulanan', label: 'Bulanan' },
        ]}
      />

      {mode === 'bulanan' && (
        <>
          <View className="mt-3 rounded-2xl bg-card p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable onPress={() => changeMonth(-1)} className="p-1">
                <Ionicons name="chevron-back" size={18} color={primary} />
              </Pressable>
              <Text className="text-sm font-bold capitalize text-ink">{monthLabel}</Text>
              <Pressable onPress={() => changeMonth(1)} className="p-1">
                <Ionicons name="chevron-forward" size={18} color={primary} />
              </Pressable>
            </View>

            <View className="flex-row">
              {WEEKDAY_LABELS.map((w, i) => (
                <View key={`${w}-${i}`} className="flex-1 items-center">
                  <Text className="text-[10px] font-semibold text-subtle">{w}</Text>
                </View>
              ))}
            </View>

            <View className="mt-1 flex-row flex-wrap">
              {gridDays.map((date, idx) => {
                if (!date) return <View key={`empty-${idx}`} style={{ width: `${100 / 7}%` }} className="py-1.5" />;
                const key = toDateKey(date);
                const isToday = key === todayKey;
                const isSelected = key === selectedKey;
                const hasReminders = remindersByDate.has(key);

                return (
                  <Pressable
                    key={key}
                    style={{ width: `${100 / 7}%` }}
                    className="items-center py-1.5"
                    onPress={() => setSelectedKey(key)}
                  >
                    <View
                      className={`h-8 w-8 items-center justify-center rounded-full ${
                        isSelected ? 'bg-primary' : isToday ? 'bg-primary-soft' : ''
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          isSelected ? 'font-bold text-white' : isToday ? 'font-bold text-primary' : 'text-ink'
                        }`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                    {hasReminders && (
                      <View
                        className="mt-0.5 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? primary : '#8A8D94' }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-3 rounded-2xl bg-card p-4">
            <Text className="mb-2 text-xs font-semibold text-muted">
              {new Date(selectedKey).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <ReminderList reminders={selectedReminders} emptyText="Tidak ada pengingat di tanggal ini." />
          </View>
        </>
      )}

      {mode === 'harian' && (
        <View className="mt-3 rounded-2xl bg-card p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable onPress={() => changeDay(-1)} className="p-1">
              <Ionicons name="chevron-back" size={18} color={primary} />
            </Pressable>
            <Text className="text-sm font-bold capitalize text-ink">
              {viewDay.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Pressable onPress={() => changeDay(1)} className="p-1">
              <Ionicons name="chevron-forward" size={18} color={primary} />
            </Pressable>
          </View>
          <ReminderList reminders={dayReminders} emptyText="Tidak ada pengingat di hari ini." />
        </View>
      )}

      {mode === 'mingguan' && (
        <View className="mt-3 rounded-2xl bg-card p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable onPress={() => changeWeek(-1)} className="p-1">
              <Ionicons name="chevron-back" size={18} color={primary} />
            </Pressable>
            <Text className="text-sm font-bold text-ink">{weekRangeLabel}</Text>
            <Pressable onPress={() => changeWeek(1)} className="p-1">
              <Ionicons name="chevron-forward" size={18} color={primary} />
            </Pressable>
          </View>

          {weekDays.map((d) => {
            const key = toDateKey(d);
            const items = weekRemindersByDate.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <View key={key} className="mb-2 border-b border-border pb-2 last:border-b-0">
                <Text className={`mb-1 text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted'}`}>
                  {d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                </Text>
                {items.length === 0 ? (
                  <Text className="text-[11px] italic text-subtle">Tidak ada pengingat.</Text>
                ) : (
                  items.map((r, idx) => (
                    <View key={`${r.reminder_id}-${idx}`} className="flex-row justify-between py-0.5">
                      <Text className="text-sm font-medium text-ink">{r.title}</Text>
                      <Text className="text-xs text-muted">{formatOccursAt(r.occurs_at)}</Text>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

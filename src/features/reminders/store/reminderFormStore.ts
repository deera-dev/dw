import { create } from 'zustand';
import type { Tables } from '../../../shared/types/database';

type Reminder = Tables<'reminders'>;

type ReminderFormState = {
  modalVisible: boolean;
  editingId: string | null;
  title: string;
  category: Reminder['category'];
  recurrence: Reminder['recurrence'];
  // Cuma dipakai kalau recurrence === 'harian' & user isi >0 jam — buat
  // pengingat yang perlu lebih dari 1x sehari (mis. minum obat pagi/siang/
  // malam). Kosong berarti pakai perilaku lama (1x sehari di jam dibuat).
  dailyTimes: string[];
  openModal: () => void;
  openEditModal: (reminder: Reminder) => void;
  closeModal: () => void;
  setTitle: (v: string) => void;
  setCategory: (v: Reminder['category']) => void;
  setRecurrence: (v: Reminder['recurrence']) => void;
  addDailyTime: (v: string) => void;
  removeDailyTime: (v: string) => void;
  reset: () => void;
};

// `editingId` null = mode tambah baru; terisi = sedang mengedit pengingat yang
// sudah ada (dibuka lewat tap pada baris pengingat, konsisten dengan pola di
// modul Keuangan).
export const useReminderFormStore = create<ReminderFormState>((set, get) => ({
  modalVisible: false,
  editingId: null,
  title: '',
  category: 'umum',
  recurrence: 'sekali',
  dailyTimes: [],
  openModal: () => set({ modalVisible: true, editingId: null }),
  openEditModal: (reminder) =>
    set({
      modalVisible: true,
      editingId: reminder.id,
      title: reminder.title,
      category: reminder.category,
      recurrence: reminder.recurrence,
      dailyTimes: reminder.daily_times ?? [],
    }),
  closeModal: () => set({ modalVisible: false }),
  setTitle: (title) => set({ title }),
  setCategory: (category) => set({ category }),
  setRecurrence: (recurrence) => set({ recurrence, dailyTimes: recurrence === 'harian' ? get().dailyTimes : [] }),
  addDailyTime: (v) =>
    set((s) => (s.dailyTimes.includes(v) ? s : { dailyTimes: [...s.dailyTimes, v].sort() })),
  removeDailyTime: (v) => set((s) => ({ dailyTimes: s.dailyTimes.filter((t) => t !== v) })),
  reset: () => set({ title: '', category: 'umum', recurrence: 'sekali', dailyTimes: [], editingId: null }),
}));

import type { Tables } from '../../shared/types/database';

type Reminder = Tables<'reminders'>;

// Label tampilan yang rapi untuk kategori pengingat — nilai di database tetap
// snake_case (umum, tanggal_penting, dst.) supaya konsisten sebagai kode,
// tapi yang dilihat user harus teks biasa.
export const REMINDER_CATEGORY_LABEL: Record<Reminder['category'], string> = {
  umum: 'Umum',
  obat: 'Obat',
  tagihan: 'Tagihan',
  tanggal_penting: 'Tanggal Penting',
  cek_kesehatan: 'Cek Kesehatan',
  kontrol_dokter: 'Kontrol Dokter',
};

export const REMINDER_RECURRENCE_LABEL: Record<Reminder['recurrence'], string> = {
  sekali: 'Sekali',
  harian: 'Harian',
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
  tahunan: 'Tahunan',
};

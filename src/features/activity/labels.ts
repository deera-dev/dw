import type { Tables } from '../../shared/types/database';

type ActivityRow = Tables<'activity_log'>;

// Nama tabel teknis -> label ramah dibaca + ikon, dipakai di kartu Riwayat
// Aktivitas. Sengaja generik (bukan render field-per-field dari payload)
// biar 1 komponen bisa nampilin ke-16 tabel tanpa perlu logic khusus per tabel.
const TABLE_META: Record<string, { label: string; icon: string }> = {
  transactions: { label: 'transaksi keuangan', icon: '💰' },
  accounts: { label: 'akun keuangan', icon: '🏦' },
  travel_plans: { label: 'rencana jalan-jalan', icon: '🧳' },
  travel_wishlist: { label: 'wishlist liburan', icon: '✈️' },
  travel_checklist_items: { label: 'checklist jalan-jalan', icon: '✅' },
  weight_logs: { label: 'catatan berat badan', icon: '⚖️' },
  blood_pressure_logs: { label: 'catatan tensi darah', icon: '❤️' },
  exercise_logs: { label: 'catatan olahraga', icon: '🏃' },
  smoking_logs: { label: 'catatan rokok', icon: '🚬' },
  water_logs: { label: 'catatan minum air', icon: '💧' },
  recipes: { label: 'resep', icon: '🍳' },
  meal_plans: { label: 'menu makan', icon: '🍽️' },
  reminders: { label: 'pengingat', icon: '⏰' },
  pregnancy_checklist_items: { label: 'checklist kehamilan', icon: '🤰' },
  pregnancy_emergency_contacts: { label: 'kontak darurat kehamilan', icon: '📞' },
  saved_places: { label: 'tempat favorit di Peta', icon: '📍' },
};

function tableMeta(tableName: string) {
  return TABLE_META[tableName] ?? { label: tableName.replace(/_/g, ' '), icon: '📄' };
}

const ACTION_VERB: Record<string, string> = {
  insert: 'menambahkan',
  update: 'mengubah',
  delete: 'menghapus',
};

// Coba tebak "judul" entri dari payload (name/title/description dsb) supaya
// baris riwayat lebih informatif daripada cuma "menambahkan transaksi".
function guessEntryTitle(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  const candidates = ['name', 'title', 'destination', 'place_name', 'description', 'menu_description', 'activity'];
  for (const key of candidates) {
    const value = p[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function describeActivity(row: ActivityRow, actorName: string): { icon: string; text: string } {
  const meta = tableMeta(row.table_name);
  const verb = ACTION_VERB[row.action] ?? row.action;
  const title = guessEntryTitle(row.payload);
  const text = title
    ? `${actorName} ${verb} ${meta.label}: "${title}"`
    : `${actorName} ${verb} ${meta.label}`;
  return { icon: meta.icon, text };
}

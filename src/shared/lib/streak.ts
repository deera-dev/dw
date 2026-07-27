// Hitung "hari beruntun" (streak) dari daftar timestamp — dipakai buat
// lencana kecil konsistensi (mis. checklist olahraga tercatat berturut-turut),
// bukan sistem poin/leaderboard, cuma teks/badge pengakuan ringan.
function toDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// `timestamps` bebas urutan & boleh banyak per hari (dideduplikasi otomatis).
// Streak dihitung mundur dari hari ini — kalau hari ini belum ada catatan,
// tetap dihitung dari kemarin (jangan langsung dianggap putus, karena hari
// belum berakhir).
export function computeStreakDays(timestamps: string[]): number {
  if (timestamps.length === 0) return 0;
  const dayKeys = new Set(timestamps.map(toDateKey));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dayKeys.has(toDateKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dayKeys.has(toDateKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

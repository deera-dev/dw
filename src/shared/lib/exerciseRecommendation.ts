import type { BmiCategory } from './bmi';

// Rekomendasi olahraga harian (PRD §4.6) — daftar tetap yang dirotasi
// berdasarkan hari dalam setahun, bukan AI/model eksternal, supaya
// Denny & Wulan melihat saran yang sama di hari yang sama. Disesuaikan per
// kategori BMI masing-masing (bukan cuma target menit generik) supaya lebih
// relevan: yang kurus fokus latihan penguatan otot, yang kelebihan berat
// fokus kardio ramah sendi dengan durasi lebih panjang.
//
// Semua aktivitas sengaja dipilih yang bisa dilakukan di rumah — tanpa kolam
// renang, sepeda, atau harus keluar rumah — supaya benar-benar praktis.
type ExerciseSuggestion = { activity: string; durationMinutes: number; note: string };

const SUGGESTIONS_BY_BMI: Record<BmiCategory, ExerciseSuggestion[]> = {
  kurus: [
    {
      activity: 'Latihan beban ringan (dumbbell/botol air) di rumah',
      durationMinutes: 20,
      note: 'Fokus bangun massa otot, bukan cuma bakar kalori.',
    },
    {
      activity: 'Push-up & squat dasar',
      durationMinutes: 15,
      note: 'Latihan beban tubuh sendiri, 2–3 set secukupnya.',
    },
    {
      activity: 'Naik-turun tangga rumah',
      durationMinutes: 15,
      note: 'Latihan kardio ringan sambil bantu bentuk otot kaki.',
    },
    {
      activity: 'Yoga penguatan otot',
      durationMinutes: 20,
      note: 'Bantu jaga fleksibilitas sekaligus kekuatan otot.',
    },
  ],
  normal: [
    { activity: 'Jalan cepat di tempat / keliling rumah', durationMinutes: 25, note: 'Kardio ringan-sedang, tanpa perlu keluar rumah.' },
    { activity: 'Senam ringan di rumah', durationMinutes: 25, note: 'Gerakan seluruh tubuh, ikuti video 15-20 menit.' },
    { activity: 'Yoga / peregangan', durationMinutes: 20, note: 'Jaga fleksibilitas & kurangi stres.' },
    { activity: 'Jumping jack & gerakan kardio ringan', durationMinutes: 15, note: 'Tingkatkan detak jantung tanpa alat.' },
    { activity: 'Naik-turun tangga rumah', durationMinutes: 15, note: 'Latihan kardio praktis di rumah.' },
  ],
  berisiko: [
    { activity: 'Jalan cepat di tempat / keliling rumah', durationMinutes: 30, note: 'Kardio intensitas sedang, ramah sendi.' },
    { activity: 'Senam aerobik ringan di rumah', durationMinutes: 30, note: 'Bantu turunkan berat secara bertahap.' },
    { activity: 'Naik-turun tangga rumah (bertahap)', durationMinutes: 20, note: 'Kardio praktis, sesuaikan kecepatan dengan napas.' },
    { activity: 'Yoga dinamis', durationMinutes: 25, note: 'Kombinasi gerak & peregangan, minim benturan.' },
  ],
  obesitas_1: [
    {
      activity: 'Jalan santai di dalam/sekitar rumah, bertahap',
      durationMinutes: 30,
      note: 'Mulai perlahan, naikkan durasi bertahap tiap minggu.',
    },
    {
      activity: 'Senam kursi / latihan duduk-berdiri',
      durationMinutes: 25,
      note: 'Rendah benturan, aman untuk sendi & lutut.',
    },
    {
      activity: 'Peregangan dinamis di rumah',
      durationMinutes: 20,
      note: 'Latihan ringan tanpa membebani sendi.',
    },
  ],
  obesitas_2: [
    {
      activity: 'Jalan santai di dalam/sekitar rumah',
      durationMinutes: 20,
      note: 'Mulai dari durasi pendek — konsisten tiap hari lebih penting dari intensitas.',
    },
    {
      activity: 'Peregangan & latihan duduk-berdiri',
      durationMinutes: 15,
      note: 'Latihan ringan untuk membangun kebiasaan aktif dulu.',
    },
    {
      activity: 'Senam ringan sambil duduk (chair exercise)',
      durationMinutes: 15,
      note: 'Sangat ramah sendi, cocok untuk pemula.',
    },
  ],
};

const GENERIC_SUGGESTIONS: ExerciseSuggestion[] = [
  { activity: 'Jalan santai di rumah', durationMinutes: 20, note: 'Isi berat & tinggi badan biar saran lebih personal.' },
  { activity: 'Peregangan ringan', durationMinutes: 10, note: 'Isi berat & tinggi badan biar saran lebih personal.' },
  { activity: 'Naik-turun tangga rumah', durationMinutes: 10, note: 'Isi berat & tinggi badan biar saran lebih personal.' },
  { activity: 'Yoga dasar', durationMinutes: 15, note: 'Isi berat & tinggi badan biar saran lebih personal.' },
  { activity: 'Senam ringan di rumah', durationMinutes: 15, note: 'Isi berat & tinggi badan biar saran lebih personal.' },
];

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

// Dipakai kalau BMI belum bisa dihitung (berat/tinggi belum diisi) — tetap
// kasih saran umum daripada tidak menampilkan apa-apa.
export function getTodayExerciseSuggestion(date: Date = new Date()): ExerciseSuggestion {
  const idx = dayOfYear(date) % GENERIC_SUGGESTIONS.length;
  return GENERIC_SUGGESTIONS[idx];
}

export function getExerciseRecommendationForBmi(
  category: BmiCategory | null,
  date: Date = new Date()
): ExerciseSuggestion {
  if (!category) return getTodayExerciseSuggestion(date);
  const list = SUGGESTIONS_BY_BMI[category];
  const idx = dayOfYear(date) % list.length;
  return list[idx];
}

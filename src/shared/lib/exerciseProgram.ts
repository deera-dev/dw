import type { BmiCategory } from './bmi';
import { idealWeightRangeKg } from './bmi';

// Program olahraga mingguan yang jelas per hari (bukan cuma satu saran acak)
// — tujuannya hidup sehat jangka panjang, jadi disusun sebagai checklist
// tetap Senin–Minggu yang berulang tiap minggu, disesuaikan per kategori BMI
// DAN per gender (pria vs wanita dapat porsi latihan yang beda, sesuai
// kebiasaan umum program fitness: pria lebih banyak porsi upper-body/push,
// wanita lebih banyak porsi lower-body/glutes + core, dua-duanya tetap dapat
// campuran kardio & fleksibilitas). Semua gerakan murni bodyweight/calisthenics
// — bisa dilakukan di rumah, TANPA alat sama sekali.
//
// Catatan penting: program ini SENGAJA tidak lagi pakai satuan menit sama
// sekali (feedback pengguna) — semua gerakan dinyatakan sebagai set x
// repetisi (gerakan yang bisa dihitung) atau set x detik (gerakan
// isometrik/tahan & peregangan). Lihat `ProgramUnit` di bawah.
export type ProgramUnit = 'repetisi' | 'detik' | 'langkah' | 'anak tangga';

export type ProgramItem = {
  activity: string;
  sets: number;
  reps: number; // jumlah repetisi, ATAU jumlah detik/langkah/anak-tangga tergantung `unit`
  unit: ProgramUnit;
  note: string;
};

export function formatPrescription(item: ProgramItem): string {
  return `${item.sets} set x ${item.reps} ${item.unit}`;
}

export function formatProgramItemLine(item: ProgramItem): string {
  return `${item.activity} · ${formatPrescription(item)}`;
}

export type ProgramGender = 'pria' | 'wanita';

const DAY_LABELS_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu'];

// ---- Kamus gerakan calisthenics (semua bodyweight, tanpa alat) ----

// 'reps'   -> dihitung sebagai repetisi (push-up, squat, dst.)
// 'hold'   -> gerakan isometrik/tahan, dihitung sebagai detik (plank, wall sit)
// 'steps'  -> gerakan jalan/langkah, dihitung sebagai langkah
// 'stairs' -> naik-turun tangga, dihitung sebagai anak tangga
// 'flex'   -> peregangan/yoga, dihitung sebagai detik tahan per pose
type MoveKind = 'reps' | 'hold' | 'steps' | 'stairs' | 'flex';

type MoveDef = {
  activity: string;
  // Varian rendah-benturan/lebih ringan untuk kategori berat badan tinggi
  // (obesitas_1/obesitas_2) — lebih ramah sendi & lebih mudah untuk pemula.
  lowImpactActivity?: string;
  // Kalau varian rendah-benturan mengubah sifat gerakan (mis. loncat jadi
  // jalan di tempat), satuannya juga bisa berubah — pakai lowImpactKind.
  lowImpactKind?: MoveKind;
  note: string;
  kind: MoveKind;
};

const MOVES = {
  pushUp: {
    activity: 'Push-up',
    lowImpactActivity: 'Push-up dari lutut (knee push-up)',
    note: 'Fokus dada, bahu & trisep — jaga punggung tetap lurus.',
    kind: 'reps',
  },
  chairDip: {
    activity: 'Tricep dip pakai kursi',
    note: 'Pegangan di tepi kursi, tekuk siku ke belakang lalu dorong naik.',
    kind: 'reps',
  },
  plank: {
    activity: 'Plank',
    note: 'Tahan badan lurus dari kepala sampai tumit, perut dikencangkan.',
    kind: 'hold',
  },
  sidePlank: {
    activity: 'Side plank (kanan-kiri)',
    note: 'Latih otot samping perut (oblique), boleh lutut ditekuk kalau masih berat.',
    kind: 'hold',
  },
  squat: {
    activity: 'Squat bodyweight',
    note: 'Turun seperti mau duduk, lutut jangan melewati ujung jari kaki.',
    kind: 'reps',
  },
  lunge: {
    activity: 'Lunge bergantian kaki',
    note: 'Jaga keseimbangan, lutut depan tertekuk sekitar 90 derajat.',
    kind: 'reps',
  },
  gluteBridge: {
    activity: 'Glute bridge (angkat pinggul)',
    note: 'Kencangkan otot bokong & paha belakang di posisi atas.',
    kind: 'reps',
  },
  wallSit: {
    activity: 'Wall sit (duduk bersandar tembok)',
    note: 'Posisi seperti duduk di kursi tak kasat mata, punggung nempel tembok.',
    kind: 'hold',
  },
  calfRaise: {
    activity: 'Calf raise (jinjit berulang)',
    note: 'Perkuat otot betis, boleh sambil pegangan kursi untuk keseimbangan.',
    kind: 'reps',
  },
  stepUp: {
    activity: 'Step-up naik-turun tangga/anak tangga rumah',
    note: 'Bergantian kaki depan, pegangan railing dulu kalau perlu.',
    kind: 'reps',
  },
  sitUp: {
    activity: 'Sit-up / crunch',
    note: 'Fokus kontraksi perut, jangan menarik-narik leher.',
    kind: 'reps',
  },
  bicycleCrunch: {
    activity: 'Bicycle crunch',
    note: 'Gerakan siku ke lutut berlawanan secara perlahan & terkontrol.',
    kind: 'reps',
  },
  superman: {
    activity: 'Superman / back extension',
    note: 'Kuatkan otot punggung bawah, tahan 2 detik saat badan terangkat.',
    kind: 'reps',
  },
  jumpingJack: {
    activity: 'Jumping jack',
    lowImpactActivity: 'Jalan cepat di tempat',
    lowImpactKind: 'steps',
    note: 'Kardio ringan untuk memanaskan & melatih seluruh tubuh.',
    kind: 'reps',
  },
  highKnees: {
    activity: 'High knees (angkat lutut cepat di tempat)',
    lowImpactActivity: 'Naik-turun tangga rumah (bertahap)',
    lowImpactKind: 'stairs',
    note: 'Angkat lutut setinggi pinggang bergantian, jaga napas tetap teratur.',
    kind: 'reps',
  },
  mountainClimber: {
    activity: 'Mountain climber',
    lowImpactActivity: 'Marching in place (jalan di tempat, lutut naik)',
    lowImpactKind: 'steps',
    note: 'Posisi plank, tarik lutut bergantian ke arah dada.',
    kind: 'reps',
  },
  jalanCepat: {
    activity: 'Jalan cepat di tempat / keliling rumah',
    note: 'Kardio dasar & aman, jaga detak jantung di intensitas sedang.',
    kind: 'steps',
  },
  naikTurunTangga: {
    activity: 'Naik-turun tangga rumah',
    note: 'Kardio praktis pakai tangga rumah, sesuaikan kecepatan dengan napas.',
    kind: 'stairs',
  },
  yoga: {
    activity: 'Yoga / peregangan',
    note: 'Jaga fleksibilitas, redakan pegal, sekaligus turunkan stres.',
    kind: 'flex',
  },
} as const satisfies Record<string, MoveDef>;

type MoveId = keyof typeof MOVES;

// ---- Penyesuaian intensitas per kategori BMI (basis sebelum progresi) ----

type TierConfig = {
  repsSets: number;
  repsCount: number;
  holdSets: number;
  holdSeconds: number;
  stepsSets: number;
  stepsCount: number;
  stairsSets: number;
  stairsCount: number;
  flexSets: number;
  flexSeconds: number;
  lowImpact: boolean;
  cue: string;
};

const TIER_BY_BMI: Record<BmiCategory, TierConfig> = {
  kurus: {
    repsSets: 3,
    repsCount: 15,
    holdSets: 3,
    holdSeconds: 35,
    stepsSets: 3,
    stepsCount: 50,
    stairsSets: 3,
    stairsCount: 25,
    flexSets: 5,
    flexSeconds: 20,
    lowImpact: false,
    cue: 'Tambah repetisi/set bertahap tiap minggu kalau sudah terasa ringan — fokus bangun massa otot.',
  },
  normal: {
    repsSets: 3,
    repsCount: 12,
    holdSets: 3,
    holdSeconds: 30,
    stepsSets: 3,
    stepsCount: 45,
    stairsSets: 3,
    stairsCount: 20,
    flexSets: 5,
    flexSeconds: 20,
    lowImpact: false,
    cue: 'Jaga konsistensi tiap set gerakan supaya berat badan ideal tetap terjaga.',
  },
  berisiko: {
    repsSets: 3,
    repsCount: 10,
    holdSets: 3,
    holdSeconds: 25,
    stepsSets: 3,
    stepsCount: 50,
    stairsSets: 3,
    stairsCount: 20,
    flexSets: 4,
    flexSeconds: 20,
    lowImpact: false,
    cue: 'Kombinasi kardio & kekuatan ini bantu turunkan berat badan secara bertahap.',
  },
  obesitas_1: {
    repsSets: 2,
    repsCount: 10,
    holdSets: 2,
    holdSeconds: 20,
    stepsSets: 3,
    stepsCount: 40,
    stairsSets: 2,
    stairsCount: 15,
    flexSets: 4,
    flexSeconds: 15,
    lowImpact: true,
    cue: 'Rendah benturan & ramah untuk sendi/lutut — dengarkan tubuh, tidak perlu dipaksakan.',
  },
  obesitas_2: {
    repsSets: 2,
    repsCount: 8,
    holdSets: 2,
    holdSeconds: 15,
    stepsSets: 2,
    stepsCount: 30,
    stairsSets: 2,
    stairsCount: 10,
    flexSets: 3,
    flexSeconds: 15,
    lowImpact: true,
    cue: 'Set/repetisi sedikit dulu, konsisten lebih penting daripada intensitas.',
  },
};

// ---- Progresi bertahap (progressive overload) ----
// Prinsip standar & aman calisthenics: naikkan volume sedikit demi sedikit
// tiap beberapa minggu, bukan langsung berat — lalu berhenti di satu fase
// maintenance yang berulang terus (bukan naik tanpa batas selamanya).
// Dihitung murni dari data sendiri (tanggal log olahraga pertama), bukan
// AI/eksternal — sesuai PRD §3.6.
export type ProgressionPhase = {
  phaseIndex: number;
  phaseName: string;
  weekRangeLabel: string;
  multiplier: number;
};

export const PROGRESSION_PHASES: ProgressionPhase[] = [
  { phaseIndex: 0, phaseName: 'Fondasi', weekRangeLabel: 'Minggu 1-2', multiplier: 1 },
  { phaseIndex: 1, phaseName: 'Berkembang', weekRangeLabel: 'Minggu 3-4', multiplier: 1.2 },
  { phaseIndex: 2, phaseName: 'Menguat', weekRangeLabel: 'Minggu 5-6', multiplier: 1.4 },
  { phaseIndex: 3, phaseName: 'Konsisten', weekRangeLabel: 'Minggu 7+', multiplier: 1.5 },
];

// weeksSinceStart null artinya belum pernah mencentang apa pun sama sekali
// (belum ada exercise_logs) — dianggap masih di Fase 1/Fondasi.
export function getProgressionPhase(weeksSinceStart: number | null): ProgressionPhase {
  if (weeksSinceStart == null || weeksSinceStart < 2) return PROGRESSION_PHASES[0];
  if (weeksSinceStart < 4) return PROGRESSION_PHASES[1];
  if (weeksSinceStart < 6) return PROGRESSION_PHASES[2];
  return PROGRESSION_PHASES[3];
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// "Lama ikut program" TIDAK disimpan sebagai kolom baru di DB — dihitung
// langsung dari tanggal exercise_logs paling awal milik user (lihat
// `fetchFirstExerciseLogDate` di api.ts). Kalau belum ada log sama sekali,
// hasilnya null (artinya masih Fase 1).
export function getWeeksSinceStart(firstLogDate: Date | string | null, now: Date = new Date()): number | null {
  if (!firstLogDate) return null;
  const start = typeof firstLogDate === 'string' ? new Date(firstLogDate) : firstLogDate;
  const diffMs = now.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / MS_PER_WEEK);
}

// Bulatkan ke kelipatan tertentu (mis. 5 detik/langkah) supaya angkanya tetap
// terasa "bulat" & enak dibaca meski sudah dikali multiplier progresi
// (menghindari hasil aneh seperti "13.75 repetisi").
function scaleCount(base: number, multiplier: number, roundToNearest = 1): number {
  const scaled = base * multiplier;
  const rounded = Math.round(scaled / roundToNearest) * roundToNearest;
  return Math.max(roundToNearest, rounded);
}

function pickActivity(id: MoveId, tier: TierConfig): string {
  const def: MoveDef = MOVES[id];
  return tier.lowImpact && def.lowImpactActivity ? def.lowImpactActivity : def.activity;
}

function pickKind(id: MoveId, tier: TierConfig): MoveKind {
  const def: MoveDef = MOVES[id];
  return tier.lowImpact && def.lowImpactKind ? def.lowImpactKind : def.kind;
}

function buildItem(id: MoveId, tier: TierConfig, multiplier: number): ProgramItem {
  const def: MoveDef = MOVES[id];
  const activity = pickActivity(id, tier);
  const kind = pickKind(id, tier);
  const note = `${def.note} ${tier.cue}`;

  switch (kind) {
    case 'reps':
      return { activity, sets: tier.repsSets, reps: scaleCount(tier.repsCount, multiplier), unit: 'repetisi', note };
    case 'hold':
      return {
        activity,
        sets: tier.holdSets,
        reps: scaleCount(tier.holdSeconds, multiplier, 5),
        unit: 'detik',
        note,
      };
    case 'steps':
      return {
        activity,
        sets: tier.stepsSets,
        reps: scaleCount(tier.stepsCount, multiplier, 5),
        unit: 'langkah',
        note,
      };
    case 'stairs':
      return {
        activity,
        sets: tier.stairsSets,
        reps: scaleCount(tier.stairsCount, multiplier, 5),
        unit: 'anak tangga',
        note,
      };
    case 'flex':
      return {
        activity,
        sets: tier.flexSets,
        reps: scaleCount(tier.flexSeconds, multiplier, 5),
        unit: 'detik',
        note,
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

// ---- Jadwal per hari (Senin=0 ... Minggu=6), beda per gender ----
// Pria: lebih sering upper-body/push (push-up, dip, plank).
// Wanita: lebih sering lower-body/glutes + core (squat, lunge, glute bridge, core).
// Netral (gender belum diisi): campuran rata, tidak berat sebelah.

const PRIA_DAYS: MoveId[][] = [
  ['pushUp', 'plank'],
  ['squat', 'lunge'],
  ['jumpingJack', 'naikTurunTangga'],
  ['chairDip', 'sitUp'],
  ['pushUp', 'squat', 'mountainClimber'],
  ['jalanCepat'],
  ['yoga'],
];

const WANITA_DAYS: MoveId[][] = [
  ['squat', 'gluteBridge'],
  ['sitUp', 'bicycleCrunch'],
  ['jumpingJack', 'naikTurunTangga'],
  ['lunge', 'wallSit'],
  ['squat', 'pushUp', 'plank'],
  ['jalanCepat'],
  ['yoga'],
];

const NETRAL_DAYS: MoveId[][] = [
  ['pushUp', 'squat'],
  ['plank', 'sitUp'],
  ['jumpingJack', 'naikTurunTangga'],
  ['squat', 'lunge'],
  ['pushUp', 'squat', 'mountainClimber'],
  ['jalanCepat'],
  ['yoga'],
];

type GenderKey = ProgramGender | 'netral';

const DAYS_BY_GENDER: Record<GenderKey, MoveId[][]> = {
  pria: PRIA_DAYS,
  wanita: WANITA_DAYS,
  netral: NETRAL_DAYS,
};

// Tiap gerakan dalam sehari jadi ITEM CHECKLIST TERPISAH (bukan digabung jadi
// satu baris seperti sebelumnya) — supaya satuannya bisa berbeda-beda per
// gerakan (repetisi vs detik vs langkah) tanpa dipaksa jadi satu angka.
function buildWeek(genderKey: GenderKey, category: BmiCategory, multiplier: number): ProgramItem[][] {
  const tier = TIER_BY_BMI[category];
  return DAYS_BY_GENDER[genderKey].map((ids) => ids.map((id) => buildItem(id, tier, multiplier)));
}

// Dipakai kalau berat/tinggi badan belum diisi sama sekali (BMI belum bisa dihitung).
const GENERIC_PROGRAM: ProgramItem[][] = Array.from({ length: 7 }, () => [
  {
    activity: 'Jalan santai di rumah',
    sets: 3,
    reps: 40,
    unit: 'langkah' as ProgramUnit,
    note: 'Isi berat & tinggi badan biar program lebih personal.',
  },
]);

// Tujuan program disesuaikan otomatis dari kategori BMI: yang belum di berat
// ideal dapat program turun/naik berat, yang sudah ideal dapat program
// maintenance — bukan cuma sekumpulan saran tanpa arah.
export const PROGRAM_GOAL_LABEL: Record<BmiCategory, string> = {
  kurus: 'Menambah berat & membangun massa otot',
  normal: 'Menjaga berat badan ideal (maintenance)',
  berisiko: 'Menurunkan berat badan',
  obesitas_1: 'Menurunkan berat badan secara bertahap',
  obesitas_2: 'Menurunkan berat badan secara bertahap & aman',
};

export function getProgramGoalLabel(category: BmiCategory | null): string {
  return category
    ? PROGRAM_GOAL_LABEL[category]
    : 'Isi berat & tinggi badan dulu supaya tujuan program bisa ditentukan';
}

// Pemanasan/pendinginan tetap konstan (tidak ikut naik-turun sesuai fase
// progresi ataupun kategori BMI) — tetap dinyatakan dalam detik, bukan menit.
const WARM_UP: ProgramItem = {
  activity: 'Pemanasan (peregangan ringan & jalan di tempat)',
  sets: 1,
  reps: 60,
  unit: 'detik',
  note: 'Wajib sebelum mulai — turunkan risiko cedera otot.',
};

const COOL_DOWN: ProgramItem = {
  activity: 'Pendinginan (peregangan penutup)',
  sets: 1,
  reps: 60,
  unit: 'detik',
  note: 'Bantu otot pulih & turunkan detak jantung perlahan.',
};

function withWarmUpCoolDown(days: ProgramItem[][]): ProgramItem[][] {
  return days.map((items) => [WARM_UP, ...items, COOL_DOWN]);
}

function dayIndexMondayFirst(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function getDayLabel(dayIndex: number) {
  return DAY_LABELS_FULL[dayIndex];
}

function genderKeyOf(gender: ProgramGender | null): GenderKey {
  return gender ?? 'netral';
}

export function getWeeklyProgram(
  category: BmiCategory | null,
  gender: ProgramGender | null = null,
  weeksSinceStart: number | null = null
): ProgramItem[][] {
  if (!category) return withWarmUpCoolDown(GENERIC_PROGRAM);
  const phase = getProgressionPhase(weeksSinceStart);
  return withWarmUpCoolDown(buildWeek(genderKeyOf(gender), category, phase.multiplier));
}

export function getTodayProgramItems(
  category: BmiCategory | null,
  gender: ProgramGender | null = null,
  weeksSinceStart: number | null = null,
  date: Date = new Date()
): ProgramItem[] {
  const program = getWeeklyProgram(category, gender, weeksSinceStart);
  return program[dayIndexMondayFirst(date)];
}

export function getTodayDayIndex(date: Date = new Date()) {
  return dayIndexMondayFirst(date);
}

// ---- Estimasi menit HANYA untuk kolom `duration_minutes` di DB ----
// Kolom ini kolom lama (NOT NULL) yang tidak bisa dihapus tanpa migrasi, jadi
// tetap harus diisi angka masuk akal tiap kali item checklist dicentang.
// Ini BUKAN klaim presisi — cuma perkiraan kasar supaya progress bar
// "menit minggu ini" yang sudah ada tetap menampilkan angka yang wajar:
// - Untuk unit 'detik' (gerakan hold/isometrik & peregangan), reps SUDAH
//   dalam satuan detik, jadi total waktu kerja bisa dihitung langsung
//   (sets x detik), tidak perlu ditebak.
// - Untuk unit 'langkah'/'anak tangga', diasumsikan ritme cepat ~0.6
//   detik per langkah/anak tangga.
// - Untuk unit 'repetisi', diasumsikan ~3 detik per repetisi (turun-naik
//   terkontrol ala gerakan bodyweight standar).
export function estimateMinutesForLog(item: ProgramItem): number {
  const totalUnits = item.sets * item.reps;
  let totalSeconds: number;
  if (item.unit === 'detik') {
    totalSeconds = totalUnits;
  } else if (item.unit === 'langkah' || item.unit === 'anak tangga') {
    totalSeconds = totalUnits * 0.6;
  } else {
    totalSeconds = totalUnits * 3;
  }
  return Math.max(1, Math.round(totalSeconds / 60));
}

// ---- Target berat & estimasi waktu (murni rumus, bukan AI/eksternal) ----

export type WeightGoalEstimate = {
  direction: 'turun' | 'naik' | 'maintain';
  deltaKg: number;
  estimatedWeeks: number | null;
  message: string;
};

// Kecepatan aman/lestari yang umum dipakai sebagai patokan: ±0.5 kg/minggu.
// Ini cuma perkiraan kasar berbasis rumus — hasil sebenarnya sangat tergantung
// pola makan juga, bukan cuma olahraga, jadi bukan jaminan.
const SAFE_KG_PER_WEEK = 0.5;

export function getWeightGoalEstimate(
  currentWeightKg: number,
  heightCm: number,
  category?: BmiCategory | null
): WeightGoalEstimate {
  const { min, max } = idealWeightRangeKg(heightCm);

  if (currentWeightKg < min) {
    const deltaKg = Math.round((min - currentWeightKg) * 10) / 10;
    const estimatedWeeks = Math.max(1, Math.ceil(deltaKg / SAFE_KG_PER_WEEK));
    return {
      direction: 'naik',
      deltaKg,
      estimatedWeeks,
      message:
        `Perlu sekitar ${deltaKg} kg lagi menuju berat ideal (${min}–${max} kg). ` +
        `Dengan kenaikan yang aman & lestari (~${SAFE_KG_PER_WEEK} kg/minggu), perkiraan kasar ${estimatedWeeks} minggu — ` +
        `tapi ini juga sangat tergantung asupan makan, bukan cuma olahraga. Perkiraan, bukan jaminan.`,
    };
  }

  if (currentWeightKg > max) {
    const deltaKg = Math.round((currentWeightKg - max) * 10) / 10;
    const estimatedWeeks = Math.max(1, Math.ceil(deltaKg / SAFE_KG_PER_WEEK));
    return {
      direction: 'turun',
      deltaKg,
      estimatedWeeks,
      message:
        `Perlu turun sekitar ${deltaKg} kg lagi menuju berat ideal (${min}–${max} kg). ` +
        `Dengan penurunan yang aman & lestari (~${SAFE_KG_PER_WEEK} kg/minggu), perkiraan kasar ${estimatedWeeks} minggu — ` +
        `tapi ini juga sangat tergantung pola makan, bukan cuma olahraga. Perkiraan, bukan jaminan.`,
    };
  }

  return {
    direction: 'maintain',
    deltaKg: 0,
    estimatedWeeks: null,
    message: `Berat badan sudah di rentang ideal (${min}–${max} kg). Program di bawah fokus menjaga (maintenance), bukan menurunkan/menaikkan berat.`,
  };
}

export { DAY_LABELS_FULL };

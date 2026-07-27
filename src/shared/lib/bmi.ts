// Tabel referensi BMI Asia-Pasifik (lebih sesuai untuk orang Indonesia
// dibanding standar WHO umum) — konstanta tetap, tidak diambil dari layanan luar.
// Lihat PRD §4.6 & §4.12.
export type BmiCategory = 'kurus' | 'normal' | 'berisiko' | 'obesitas_1' | 'obesitas_2';

export const BMI_CATEGORY_LABEL: Record<BmiCategory, string> = {
  kurus: 'Kurus',
  normal: 'Normal',
  berisiko: 'Kelebihan berat badan',
  obesitas_1: 'Obesitas I',
  obesitas_2: 'Obesitas II',
};

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function categorizeBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'kurus';
  if (bmi < 23) return 'normal';
  if (bmi < 25) return 'berisiko';
  if (bmi < 30) return 'obesitas_1';
  return 'obesitas_2';
}

// Rentang berat ideal (kg) berdasarkan BMI normal Asia-Pasifik 18.5–22.9.
export function idealWeightRangeKg(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return {
    min: Math.round(18.5 * heightM * heightM * 10) / 10,
    max: Math.round(22.9 * heightM * heightM * 10) / 10,
  };
}

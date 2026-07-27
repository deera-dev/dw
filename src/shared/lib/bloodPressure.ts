// Tabel referensi kategori tensi darah standar (acuan umum AHA/Kemenkes),
// disimpan sebagai konstanta tetap di kode — bukan diambil live dari
// internet — sesuai prinsip PRD §4.12 Analisa Data.
export type BpCategory = 'normal' | 'meningkat' | 'hipertensi_1' | 'hipertensi_2' | 'krisis';

export const BP_CATEGORY_LABEL: Record<BpCategory, string> = {
  normal: 'Normal',
  meningkat: 'Meningkat',
  hipertensi_1: 'Hipertensi Tahap 1',
  hipertensi_2: 'Hipertensi Tahap 2',
  krisis: 'Krisis Hipertensi',
};

export function categorizeBloodPressure(systolic: number, diastolic: number): BpCategory {
  if (systolic > 180 || diastolic > 120) return 'krisis';
  if (systolic >= 140 || diastolic >= 90) return 'hipertensi_2';
  if (systolic >= 130 || diastolic >= 80) return 'hipertensi_1';
  if (systolic >= 120 && diastolic < 80) return 'meningkat';
  return 'normal';
}

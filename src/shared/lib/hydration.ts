// Definisi ukuran "gelas" dipakai konsisten di seluruh app — supaya jelas
// berapa ml sebenarnya yang dicatat, bukan cuma angka gelas yang ambigu.
// 250 ml adalah ukuran gelas standar umum di Indonesia.
export const WATER_GLASS_ML = 250;

export function glassesToMl(glasses: number): number {
  return glasses * WATER_GLASS_ML;
}

export function formatMl(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)} L`;
  }
  return `${ml} ml`;
}

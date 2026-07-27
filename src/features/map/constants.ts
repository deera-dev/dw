import type { Ionicons } from '@expo/vector-icons';

export type PlaceCategory = 'resto_cafe' | 'tempat_date' | 'wishlist_liburan' | 'rumah' | 'lainnya';

export const PLACE_CATEGORIES: {
  value: PlaceCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'rumah', label: 'Rumah', icon: 'home' },
  { value: 'resto_cafe', label: 'Resto & Cafe', icon: 'restaurant' },
  { value: 'tempat_date', label: 'Tempat Date', icon: 'heart' },
  { value: 'wishlist_liburan', label: 'Wishlist Liburan', icon: 'airplane' },
  { value: 'lainnya', label: 'Lainnya', icon: 'location' },
];

// Ambang batas kecepatan (m/s) buat indikasi "sedang berkendara" di peta —
// ~8 m/s (~29 km/j) dipilih supaya jalan cepat/jogging tidak salah terdeteksi
// sebagai naik kendaraan, tapi cukup rendah buat nangkep motor/mobil di kota.
export const DRIVING_SPEED_THRESHOLD_MPS = 8;

// Radius dianggap "di rumah" kalau dekat pin kategori 'rumah'.
export const HOME_RADIUS_M = 150;

// Stay dianggap "kemungkinan menginap" kalau sudah berlangsung >= ini DAN
// dimulai pada jam malam (lihat isLikelyOvernightStay di geo-status util).
export const OVERNIGHT_MIN_HOURS = 5;

export function categoryLabel(value: string) {
  return PLACE_CATEGORIES.find((c) => c.value === value)?.label ?? 'Lainnya';
}

export function categoryIcon(value: string): keyof typeof Ionicons.glyphMap {
  return PLACE_CATEGORIES.find((c) => c.value === value)?.icon ?? 'location';
}

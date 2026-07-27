import { vars } from 'nativewind';
import { emailToUsername } from '../lib/auth';

// Tema per-akun. Ditentukan dari prefix email (sebelum "@deera.id"),
// yang sama dengan username yang diketik user di layar login.
export type ThemeKey = 'denny' | 'wulan' | 'default';

type ThemePalette = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
};

// Aplikasi dipakai berdua dengan tema dark (Denny & Wulan lebih suka gelap).
// Warna aksen (primary) dibikin lebih jenuh/vivid dari revisi pertama —
// percobaan awal (navy & rosewood yang terlalu di-lightening) jadi kelihatan
// pudar/kurang jadi pembeda di atas kartu gelap. Sekarang dinaikkan saturasi
// & kecerahannya supaya tetap "navy" / "rosewood" tapi jadi aksen yang tegas.
export const themeColors: Record<ThemeKey, ThemePalette> = {
  denny: {
    primary: '#3D72D6', // navy-biru vivid, jadi aksen tegas di atas dark
    primaryDark: '#9FC1FF', // biru terang, buat teks aksen di atas chip primary-soft
    primarySoft: '#1B2C4D', // tint navy yang lebih jenuh buat background chip/info box
  },
  wulan: {
    primary: '#E0507D', // rose vivid, kontras jelas dari navy Denny
    primaryDark: '#FFA9C4', // pink terang, buat teks aksen di atas chip primary-soft
    primarySoft: '#3D1D2C', // tint rose yang lebih jenuh buat background chip/info box
  },
  default: {
    primary: '#9AA0A8',
    primaryDark: '#E5E5E5',
    primarySoft: '#242424',
  },
};

// Palet dark mode global (tidak per-akun) — dipakai untuk background halaman,
// kartu, border, dan warna teks di seluruh app.
const DARK_BASE = {
  ink: '#EDEDED', // teks utama
  surface: '#0F1115', // background halaman
  card: '#1B1E24', // background kartu/modal (sedikit lebih terang dari surface)
  border: '#3C4048', // garis pemisah/border input — dinaikkan kontrasnya dari revisi awal (#2C2F36 nyaris tak kelihatan di atas kartu)
  subtle: '#8A8D94', // teks sekunder redup (dulu gray-300/400/500)
  muted: '#9AA0A8', // label sekunder
  danger: '#E5766D', // merah lebih terang biar kebaca di atas dark
  success: '#6FCB74', // hijau lebih terang
};

export function getThemeKey(email?: string | null): ThemeKey {
  const username = emailToUsername(email);
  if (username === 'denny') return 'denny';
  if (username === 'wulan') return 'wulan';
  return 'default';
}

// Style object berisi CSS variable, dipasang di View paling luar (dan juga di
// tiap Modal lewat useThemeVars, karena Modal RN dirender di root terpisah).
// Anak-anaknya bisa pakai class seperti bg-primary / text-ink / bg-card dst.
export function getThemeVars(key: ThemeKey) {
  const c = themeColors[key];
  return vars({
    '--color-primary': c.primary,
    '--color-primary-dark': c.primaryDark,
    '--color-primary-soft': c.primarySoft,
    '--color-ink': DARK_BASE.ink,
    '--color-surface': DARK_BASE.surface,
    '--color-card': DARK_BASE.card,
    '--color-border': DARK_BASE.border,
    '--color-subtle': DARK_BASE.subtle,
    '--color-muted': DARK_BASE.muted,
    '--color-danger': DARK_BASE.danger,
    '--color-success': DARK_BASE.success,
  });
}

// Hex mentah (bukan var) buat komponen native yang tidak ikut nativewind,
// misalnya tabBarStyle react-navigation.
export const darkPalette = DARK_BASE;

// Aksen tetap untuk layar sebelum login (mis. tombol Masuk) — sengaja TIDAK
// pakai `themeColors.default.primary` (abu-abu) karena itu memang dibuat
// netral untuk elemen non-interaktif, dan bikin tombol kelihatan disabled.
export const BRAND_ACCENT = '#4C7EF3';

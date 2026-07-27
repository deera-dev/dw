import { useAuthStore } from '../../features/auth/store/authStore';
import { darkPalette, getThemeKey, getThemeVars, themeColors } from './theme';

// Dipakai di komponen mana pun yang butuh warna tema aktif — termasuk WAJIB
// dipakai di dalam <Modal>, karena React Native Modal merender kontennya di
// root terpisah (native modal host), jadi CSS variable dari View pembungkus
// di RootNavigator TIDAK ikut turun ke dalamnya. Tanpa ini, class seperti
// bg-primary di dalam Modal jadi transparan/putih (teks putih di atasnya
// jadi tidak kebaca — itu penyebab chip kategori/pengulangan kelihatan kosong).
export function useThemeVars() {
  const session = useAuthStore((s) => s.session);
  const themeKey = getThemeKey(session?.user.email);
  const colors = themeColors[themeKey];

  return {
    themeKey,
    themeVars: getThemeVars(themeKey),
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primarySoft: colors.primarySoft,
    subtle: darkPalette.subtle,
    muted: darkPalette.muted,
    danger: darkPalette.danger,
    success: darkPalette.success,
  };
}

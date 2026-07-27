import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeVars } from '../theme/useThemeVars';

type ScreenHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

// Header konsisten untuk tiap layar utama — ikon bulat beraksen warna tema +
// judul, biar terasa "dirancang" bukan cuma teks polos rata kiri.
// `insets.top` ditambahkan sebagai marginTop dinamis (tinggi status bar/notch)
// supaya header tidak nabrak status bar — tiap layar sudah punya padding tetap
// sendiri di View pembungkusnya (mis. `pt-4`), ini menambah jarak ekstra di atasnya.
export default function ScreenHeader({ icon, title, subtitle }: ScreenHeaderProps) {
  const { primary } = useThemeVars();
  const insets = useSafeAreaInsets();

  return (
    <View className="mb-4 flex-row items-center gap-3" style={{ marginTop: insets.top }}>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
        <Ionicons name={icon} size={20} color={primary} />
      </View>
      <View>
        <Text className="font-title text-xl font-bold text-ink">{title}</Text>
        {subtitle ? <Text className="text-xs text-muted">{subtitle}</Text> : null}
      </View>
    </View>
  );
}

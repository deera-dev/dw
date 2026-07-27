import './src/app/global.css';
import './src/shared/lib/mapbox';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/app/queryClient';
import { useAuthStore } from './src/features/auth/store/authStore';
import RootNavigator from './src/app/RootNavigator';
import { applyGlobalFonts } from './src/shared/theme/globalFonts';
import { darkPalette } from './src/shared/theme/theme';

export default function App() {
  const init = useAuthStore((s) => s.init);
  const [fontsLoaded] = useFonts({
    RealisticNature: require('./assets/fonts/RealisticNature.otf'),
    Sleggie: require('./assets/fonts/Sleggie.ttf'),
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (fontsLoaded) applyGlobalFonts();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Belum ada teks yang butuh dirender sebelum font siap, jadi cukup layar kosong sebentar
    // (dark, biar konsisten sama tema app & tidak "kedip putih" pas buka app).
    // Pakai hex langsung (bukan class bg-surface) karena CSS variable tema
    // belum ke-mount di titik ini (RootNavigator belum render).
    return <View style={{ flex: 1, backgroundColor: darkPalette.surface }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

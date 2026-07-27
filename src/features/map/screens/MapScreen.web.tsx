import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import Card from '../../../shared/ui/Card';

// Varian khusus web (Metro/Expo otomatis pakai file `.web.tsx` ini saat
// preview di browser, menggantikan `MapScreen.tsx`). Fitur Peta Berdua
// butuh @rnmapbox/maps native + izin lokasi HP — sengaja tidak dibuatkan
// versi web (lihat PRD §4.13/§5.1: butuh development build, bukan target
// web sama sekali), jadi di sini cukup ditampilkan pesan penjelasan supaya
// preview web untuk tab lain tetap jalan normal.
export default function MapScreen() {
  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="map" title="Peta Berdua" subtitle="Lokasi realtime & tempat favorit" />
      </View>
      <View className="px-4">
        <Card className="items-center py-8">
          <Ionicons name="phone-portrait-outline" size={32} color="#8A8D94" />
          <Text className="mt-3 text-center text-sm text-ink">
            Fitur Peta Berdua cuma tersedia di aplikasi Android/iOS (development build), belum didukung di preview
            web.
          </Text>
        </Card>
      </View>
    </View>
  );
}

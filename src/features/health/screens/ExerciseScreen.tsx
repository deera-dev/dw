import React from 'react';
import { View, ScrollView } from 'react-native';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import ExerciseSection from '../components/ExerciseSection';

// Olahraga jadi sub-tab di dalam "Sehat" (bareng Kesehatan & Kehamilan) —
// bukan tab bottom-nav sendiri, tapi tetap dipisah dari konten Kesehatan
// biar user bisa fokus ke checklist programnya tanpa scroll panjang.
export default function ExerciseScreen({ showHeader = true }: { showHeader?: boolean } = {}) {
  return (
    <View className="flex-1 bg-surface">
      {showHeader && (
        <View className="px-4 pt-4">
          <ScreenHeader icon="barbell" title="Olahraga" subtitle="Program checklist harian, Denny & Wulan" />
        </View>
      )}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <ExerciseSection />
      </ScrollView>
    </View>
  );
}

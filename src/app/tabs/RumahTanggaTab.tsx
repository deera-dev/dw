import React, { useState } from 'react';
import { View } from 'react-native';
import SegmentedTabs from '../../shared/ui/SegmentedTabs';
import MealPlanScreen from '../../features/meal-plan/screens/MealPlanScreen';
import RemindersScreen from '../../features/reminders/screens/RemindersScreen';

type Section = 'makan' | 'pengingat';

// Menggabungkan Makan & Pengingat jadi satu tab "Rumah Tangga" supaya menu
// bottom tab tidak terlalu banyak — masing-masing layar tetap punya header
// dan navigasi internalnya sendiri (mis. Menu Harian/Resep di dalam Makan).
export default function RumahTanggaTab() {
  const [section, setSection] = useState<Section>('makan');

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-surface pt-2">
        <SegmentedTabs
          value={section}
          onChange={(v) => setSection(v as Section)}
          options={[
            { value: 'makan', label: 'Makan' },
            { value: 'pengingat', label: 'Pengingat' },
          ]}
        />
      </View>
      <View className="flex-1">{section === 'makan' ? <MealPlanScreen /> : <RemindersScreen />}</View>
    </View>
  );
}

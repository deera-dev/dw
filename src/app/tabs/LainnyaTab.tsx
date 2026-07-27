import React, { useState } from 'react';
import { View } from 'react-native';
import SegmentedTabs from '../../shared/ui/SegmentedTabs';
import TravelScreen from '../../features/travel/screens/TravelScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';

type Section = 'liburan' | 'profil';

// Menggabungkan Jalan-Jalan & Profil jadi satu tab "Lainnya".
export default function LainnyaTab() {
  const [section, setSection] = useState<Section>('liburan');

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-surface pt-2">
        <SegmentedTabs
          value={section}
          onChange={(v) => setSection(v as Section)}
          options={[
            { value: 'liburan', label: 'Jalan-Jalan' },
            { value: 'profil', label: 'Profil' },
          ]}
        />
      </View>
      <View className="flex-1">{section === 'liburan' ? <TravelScreen /> : <ProfileScreen />}</View>
    </View>
  );
}

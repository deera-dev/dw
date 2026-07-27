import React, { useState } from 'react';
import { View } from 'react-native';
import ScreenHeader from '../../shared/ui/ScreenHeader';
import SegmentedTabs from '../../shared/ui/SegmentedTabs';
import HealthScreen from '../../features/health/screens/HealthScreen';
import PregnancyScreen from '../../features/pregnancy/screens/PregnancyScreen';
import ExerciseScreen from '../../features/health/screens/ExerciseScreen';
import FadeIn from '../../shared/ui/FadeIn';

type Section = 'kesehatan' | 'olahraga' | 'kehamilan';

// Menggabungkan Kesehatan, Olahraga & Kehamilan jadi satu tab "Sehat" — header
// judul tetap sticky di atas, sub-tab di bawahnya, baru konten layar
// masing-masing (tanpa header sendiri, lewat prop showHeader). Olahraga sempat
// jadi tab bottom-nav sendiri, tapi digabung balik ke sini atas permintaan user.
export default function SehatTab() {
  const [section, setSection] = useState<Section>('kesehatan');

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="heart" title="Sehat" subtitle="Kesehatan, olahraga & kehamilan, berdua" />
      </View>

      <SegmentedTabs
        value={section}
        onChange={(v) => setSection(v as Section)}
        options={[
          { value: 'kesehatan', label: 'Kesehatan' },
          { value: 'olahraga', label: 'Olahraga' },
          { value: 'kehamilan', label: 'Kehamilan' },
        ]}
      />

      <FadeIn key={section}>
        {section === 'kesehatan' && <HealthScreen showHeader={false} />}
        {section === 'olahraga' && <ExerciseScreen showHeader={false} />}
        {section === 'kehamilan' && <PregnancyScreen showHeader={false} />}
      </FadeIn>
    </View>
  );
}

import React, { useState } from 'react';
import { View } from 'react-native';
import ScreenHeader from '../../shared/ui/ScreenHeader';
import SegmentedTabs from '../../shared/ui/SegmentedTabs';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import RemindersScreen from '../../features/reminders/screens/RemindersScreen';
import ActivityLogScreen from '../../features/activity/screens/ActivityLogScreen';

type Section = 'profil' | 'pengingat' | 'riwayat';

// Pengingat & Riwayat Aktivitas digabung ke sini (bersama Profil) supaya
// tidak perlu tab sendiri-sendiri di bottom bar — header "Pengaturan" tetap
// sticky di atas, sub-tab di bawahnya untuk pindah antar-section.
export default function PengaturanTab() {
  const [section, setSection] = useState<Section>('profil');

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="settings" title="Pengaturan" subtitle="Profil, pengingat & riwayat berdua" />
      </View>

      <SegmentedTabs
        value={section}
        onChange={(v) => setSection(v as Section)}
        options={[
          { value: 'profil', label: 'Profil' },
          { value: 'pengingat', label: 'Pengingat' },
          { value: 'riwayat', label: 'Riwayat' },
        ]}
      />

      <View className="flex-1">
        {section === 'profil' && <ProfileScreen showHeader={false} />}
        {section === 'pengingat' && <RemindersScreen showHeader={false} />}
        {section === 'riwayat' && <ActivityLogScreen showHeader={false} />}
      </View>
    </View>
  );
}

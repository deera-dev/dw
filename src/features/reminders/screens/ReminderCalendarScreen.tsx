import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import ScreenHeader from '../../../shared/ui/ScreenHeader';
import SegmentedTabs from '../../../shared/ui/SegmentedTabs';
import RemindersCalendar from '../components/RemindersCalendar';
import RemindersScreen from './RemindersScreen';
import ImportantDatesSection from '../../profile/components/ImportantDatesSection';
import FadeIn from '../../../shared/ui/FadeIn';

type Section = 'kalender' | 'pengingat' | 'tanggal_penting';

// Kalender, Pengingat, dan Tanggal Penting digabung jadi satu hub karena
// isinya sama-sama seputar jadwal — header sticky di atas, sub-tab di
// bawahnya untuk pindah antar bagian.
export default function ReminderCalendarScreen() {
  const [section, setSection] = useState<Section>('kalender');

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4">
        <ScreenHeader icon="calendar" title="Kalender" subtitle="Kalender, pengingat & tanggal penting" />
      </View>

      <SegmentedTabs
        value={section}
        onChange={(v) => setSection(v as Section)}
        options={[
          { value: 'kalender', label: 'Kalender' },
          { value: 'pengingat', label: 'Pengingat' },
          { value: 'tanggal_penting', label: 'Tanggal Penting' },
        ]}
      />

      <FadeIn key={section}>
        {section === 'kalender' && (
          <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 12 }}>
            <RemindersCalendar />
          </ScrollView>
        )}
        {section === 'pengingat' && <RemindersScreen showHeader={false} />}
        {section === 'tanggal_penting' && (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <ImportantDatesSection />
          </ScrollView>
        )}
      </FadeIn>
    </View>
  );
}

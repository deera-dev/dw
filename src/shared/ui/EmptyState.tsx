import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

// Empty state yang terasa ramah (ikon + kalimat ajakan), bukan cuma teks
// abu-abu polos "Belum ada data."
export default function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <View className="items-center py-10">
      <Ionicons name={icon} size={32} color="#8A8D94" />
      <Text className="mt-2 text-center text-sm text-subtle">{text}</Text>
    </View>
  );
}

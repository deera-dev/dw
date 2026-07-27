import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-primary"
      style={({ pressed }) => [
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      <Ionicons name="add" size={26} color="#fff" />
    </Pressable>
  );
}

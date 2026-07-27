import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Option = { value: string; label: string };

export default function SegmentedTabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  return (
    <View className="flex-row gap-2 px-4 pb-1 pt-3">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            className={`flex-1 items-center rounded-xl border p-2.5 ${
              active ? 'border-primary bg-primary' : 'border-border bg-card'
            }`}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onChange(opt.value)}
          >
            <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-ink'}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

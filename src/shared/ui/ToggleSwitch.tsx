import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useThemeVars } from '../theme/useThemeVars';

// React Native's built-in <Switch> tidak reliable diklik di react-native-web
// (sama seperti Alert.alert & DateTimePicker yang juga bermasalah di web) —
// jadi dibuat toggle sendiri pakai Pressable supaya konsisten & pasti bisa
// diklik di semua platform, termasuk saat dites via browser. Posisi thumb
// dianimasikan (bukan lompat langsung) biar terasa lebih halus.
export default function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { primary } = useThemeVars();
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
      className="h-6 w-11 justify-center rounded-full px-0.5"
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View
        className="h-6 w-11 justify-center rounded-full px-0.5"
        style={{ backgroundColor: value ? primary : '#3A3D44', position: 'absolute' }}
      />
      {/* Semua styling lewat inline style (bukan className) — NativeWind tidak
          selalu meng-intercept className di Animated.View, jadi kalau dikasih
          className thumb ini bisa jadi transparan/tidak kelihatan sama sekali. */}
      <Animated.View
        style={{
          height: 20,
          width: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX }],
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      />
    </Pressable>
  );
}

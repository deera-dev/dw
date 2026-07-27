import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Pembungkus animasi fade sederhana (pakai Animated bawaan RN, tanpa
// dependency tambahan) — dipakai buat konten yang berpindah lewat sub-tab
// (SegmentedTabs) supaya transisinya halus, bukan langsung "ganti paksa".
// Kasih `key` yang beda tiap kali kontennya ganti biar animasi ini re-trigger.
export default function FadeIn({
  children,
  duration = 180,
  style,
}: {
  children: React.ReactNode;
  duration?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[{ flex: 1, opacity }, style]}>{children}</Animated.View>;
}

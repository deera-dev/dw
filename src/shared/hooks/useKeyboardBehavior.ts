import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingViewProps, Platform } from 'react-native';

// Sejak Expo SDK 53+, mode "edge-to-edge" di Android aktif secara default —
// dan itu bentrok dengan cara KeyboardAvoidingView menghitung tinggi keyboard
// kalau `behavior` selalu di-set (bisa bikin ada spasi hitam aneh & keyboard
// tetap nutupin input). Fix yang terbukti jalan: `behavior` HANYA aktif
// selagi keyboard betulan muncul, `undefined` waktu keyboard tersembunyi.
export function useKeyboardBehavior() {
  const activeValue: KeyboardAvoidingViewProps['behavior'] = Platform.OS === 'ios' ? 'padding' : 'height';
  const [behavior, setBehavior] = useState<KeyboardAvoidingViewProps['behavior']>(undefined);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setBehavior(activeValue));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setBehavior(undefined));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return behavior;
}

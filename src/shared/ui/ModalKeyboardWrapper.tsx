import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

// Bug yang cukup umum di RN: <Modal> di Android jalan di "window" terpisah
// dari layar utama, jadi resize otomatis layar (waktu keyboard muncul) TIDAK
// ikut berlaku di dalam Modal — input yang lagi diketik jadi ketutup
// keyboard. Wrapper ini dipakai di semua form bottom-sheet (Modal + TextInput)
// supaya konten otomatis naik & bisa di-scroll kalau kepanjangan.
export default function ModalKeyboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: 'flex-end' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

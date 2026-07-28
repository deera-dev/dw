import React, { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

// GANTI total dari RN <Modal>: di Android, <Modal> bawaan RN dirender di
// window Dialog yang terpisah dari layar utama — dan KeyboardAvoidingView di
// dalamnya sering GAGAL mendeteksi/merespons keyboard dengan benar (bug lama
// RN di Android, bukan salah konfigurasi). Fix-nya: jangan pakai <Modal> sama
// sekali, render overlay ini LANGSUNG di tree layar yang sama (posisi
// absolute nutupin seluruh layar) supaya tetap 1 window dengan konten lain,
// dan keyboard-avoiding-nya jadi bisa diandalkan.
//
// CATATAN: KeyboardAvoidingView SENGAJA tidak dipasang lagi di sini — sudah
// ada satu di root App.tsx yang membungkus seluruh RootNavigator (termasuk
// overlay ini, karena tetap anak dari tree yang sama). Kalau dipasang dobel,
// perhitungan offset-nya bentrok dan itu jadi penyebab input paling bawah
// tetap ketutupan waktu ada banyak field dalam satu form.
export default function BottomSheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!visible || !onClose) return;
    // Tombol back Android biasanya otomatis nutup <Modal> bawaan RN — karena
    // sekarang bukan <Modal> lagi, kita tangani manual biar perilakunya sama.
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

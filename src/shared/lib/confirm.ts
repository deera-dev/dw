import { Alert, Platform } from 'react-native';

// react-native-web punya Alert.alert() yang benar-benar no-op (lihat
// react-native-web/src/exports/Alert) — jadi SEMUA dialog konfirmasi/alert
// yang mengandalkan Alert.alert() gagal senyap total kalau dites lewat
// browser (tombol hapus/simpan yang "kelihatan ada" tapi tidak pernah
// memicu apa-apa). Ini melanggar prinsip PRD §3.7 "jangan pernah diam-diam
// gagal". Dua helper ini dipakai di seluruh app menggantikan Alert.alert
// langsung, supaya perilakunya konsisten baik di native (Expo Go/dev build)
// maupun di preview web.

// Alert info/error satu tombol.
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

// Dialog konfirmasi dua tombol (Batal / aksi). `destructive` cuma memengaruhi
// warna tombol di native — di web pakai window.confirm bawaan browser.
export function confirmAction(params: {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  const { title, message, confirmLabel = 'Hapus', destructive = true, onConfirm } = params;

  if (Platform.OS === 'web') {
    const ok = window.confirm(message ? `${title}\n\n${message}` : title);
    if (ok) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Batal', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

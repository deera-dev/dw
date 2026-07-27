import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Notifikasi yang datang saat app sedang dibuka tetap ditampilkan (alert + suara),
// bukan cuma numpuk diam-diam di notification tray.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Dipanggil sekali setelah login berhasil. Minta izin notifikasi, ambil Expo push
// token perangkat ini, simpan ke profiles.push_token — dipakai Edge Function
// send-due-reminders / send-daily-digest untuk kirim push ke HP Denny & Wulan.
export async function registerPushToken(userId: string) {
  if (!Device.isDevice) {
    // Emulator/simulator tidak punya push token asli — jangan gagal berisik, cukup skip.
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // projectId cuma terisi setelah `eas build:configure` dijalankan (menulis ke app.json).
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('EAS projectId belum ada — jalankan `eas build:configure` dulu.');
    return;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    await supabase.from('profiles').update({ push_token: tokenResponse.data }).eq('id', userId);
  } catch (e) {
    console.warn('Gagal ambil/simpan push token:', e);
  }
}

// Dipanggil sebelum sign out, biar HP yang sudah logout tidak terus kebagian
// notifikasi yang seharusnya cuma untuk sesi yang aktif.
export async function clearPushToken(userId: string) {
  await supabase.from('profiles').update({ push_token: null }).eq('id', userId);
}

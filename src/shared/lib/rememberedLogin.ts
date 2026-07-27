import AsyncStorage from '@react-native-async-storage/async-storage';

// "Ingat saya" di layar login — cuma penyimpanan lokal di HP (bukan di
// Supabase), jadi tetap sejalan dengan prinsip PRD "keamanan wajar, bukan
// enkripsi tingkat enterprise" untuk aplikasi personal 2 pengguna ini.
const KEY = 'dw_remembered_login';

export type RememberedLogin = { username: string; password: string };

export async function saveRememberedLogin(login: RememberedLogin) {
  await AsyncStorage.setItem(KEY, JSON.stringify(login));
}

export async function loadRememberedLogin(): Promise<RememberedLogin | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RememberedLogin;
  } catch {
    return null;
  }
}

export async function clearRememberedLogin() {
  await AsyncStorage.removeItem(KEY);
}

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../shared/lib/supabase';
import { clearPushToken, registerPushToken } from '../../../shared/lib/notifications';

type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  init: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SESSION_TIMEOUT_MS = 8000;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  error: null,

  // Dipanggil sekali di root App — hanya menyambungkan listener Supabase Auth ke store,
  // tidak ada logic tambahan di sini.
  init: () => {
    // Kalau sesi tersimpan di HP korup/kadaluarsa (mis. sempat login saat jam HP salah),
    // getSession() bisa nyangkut coba refresh token tanpa pernah resolve/reject.
    // Timeout ini jadi jaring pengaman: paksa berhenti loading & bersihkan sesi lama.
    const timeout = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), SESSION_TIMEOUT_MS)
    );

    Promise.race([supabase.auth.getSession(), timeout])
      .then(async (result) => {
        if (result === 'timeout') {
          await AsyncStorage.clear().catch(() => {});
          set({
            loading: false,
            error: 'Sesi login lama bermasalah dan sudah dibersihkan. Silakan masuk lagi.',
          });
          return;
        }
        const { data, error } = result;
        if (error) {
          set({ loading: false, error: error.message });
          return;
        }
        set({ session: data.session, loading: false });
        if (data.session) registerPushToken(data.session.user.id);
      })
      .catch((e: any) => {
        // Tanpa catch ini, kalau getSession() reject (mis. HP tidak bisa
        // menjangkau Supabase), loading tidak pernah jadi false —
        // aplikasi kelihatan "loading terus" tanpa pesan apa pun.
        set({ loading: false, error: e?.message ?? 'Gagal terhubung ke server.' });
      });
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session });
      if (event === 'SIGNED_IN' && session) registerPushToken(session.user.id);
    });
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ error: error.message });
  },

  signOut: async () => {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (userId) await clearPushToken(userId).catch(() => {});
    await supabase.auth.signOut();
  },
}));

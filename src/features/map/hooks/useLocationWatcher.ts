import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { showAlert } from '../../../shared/lib/confirm';
import { useUpsertLocation } from './useMap';

// Selagi `enabled` (is_sharing dari toggle Pengaturan/Peta) aktif, pantau
// posisi & upsert ke Supabase berkala — bukan setiap detik seperti aplikasi
// ojek online, cukup tiap ~50m perpindahan atau 90 detik (lihat PRD §4.13:
// "baterai & privasi", bukan aplikasi pelacakan presisi tinggi).
export function useLocationWatcher(profileId: string | undefined, enabled: boolean) {
  const upsert = useUpsertLocation();
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !profileId) {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      return;
    }

    let cancelled = false;
    // Ditangkap ke const lokal supaya TypeScript tetap tahu ini `string` (bukan
    // `string | undefined`) di dalam closure callback watchPositionAsync di bawah.
    const pid = profileId;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'Izin lokasi ditolak',
          'Aktifkan izin lokasi di pengaturan HP supaya fitur berbagi lokasi bisa jalan.'
        );
        return;
      }
      if (cancelled) return;
      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 90_000, distanceInterval: 50 },
        (loc) => {
          upsert.mutate({
            profileId: pid,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            // `speed` dari expo-location dalam m/s, bisa null kalau device/GPS
            // fix tidak menyediakan info kecepatan — dipakai UI buat indikasi
            // "sedang berkendara", cuma nilai sesaat (bukan histori).
            speedMps: loc.coords.speed ?? null,
          });
        }
      );
    }

    start().catch((e: any) => showAlert('Gagal mengaktifkan lokasi', e?.message ?? String(e)));

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, profileId]);
}

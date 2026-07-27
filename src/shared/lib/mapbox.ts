import Mapbox from '@rnmapbox/maps';

// Dipanggil sekali di root App (lihat App.tsx) — mendaftarkan public access
// token Mapbox sebelum MapView manapun di-render. Berbeda dari Supabase yang
// wajib ada (app throw error kalau kosong), di sini sengaja cuma warning:
// fitur Peta Berdua jadi satu-satunya yang kena dampak (peta kosong), bukan
// bikin seluruh app crash di startup.
const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string | undefined;

if (token) {
  Mapbox.setAccessToken(token);
} else if (__DEV__) {
  console.warn(
    'EXPO_PUBLIC_MAPBOX_TOKEN belum diset di .env — fitur Peta Berdua tidak akan menampilkan peta sampai token diisi.'
  );
}

export default Mapbox;

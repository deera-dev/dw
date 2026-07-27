// Varian khusus web (Metro/Expo otomatis pakai file `.web.ts` ini saat build
// untuk platform web, menggantikan `mapbox.ts`) — SENGAJA kosong/no-op.
//
// `@rnmapbox/maps` versi web membutuhkan paket `mapbox-gl` + import CSS-nya
// (`mapbox-gl/dist/mapbox-gl.css`), yang bikin Metro bundler gagal resolve
// saat preview lewat `expo start` + tekan `w` (web belum dikonfigurasi untuk
// import CSS dari node_modules). Karena fitur Peta Berdua memang didesain
// native-only (butuh development build, lihat PRD §4.13 & §5.1 — tidak jalan
// penuh di Expo Go/web), file ini cuma jaga supaya import `./mapbox` di
// App.tsx tidak ikut menyeret @rnmapbox/maps ke bundle web sama sekali.
export default {} as any;

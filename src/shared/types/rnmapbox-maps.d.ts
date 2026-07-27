// Shim sementara: environment build lokal ini gagal menyalin file .d.ts asli
// dari paket @rnmapbox/maps (cuma .d.ts.map yang ke-extract, entah kenapa —
// kemungkinan kuirk npm cache/sandbox, bukan masalah dari paketnya sendiri).
// Ini TIDAK memengaruhi build EAS (yang melakukan npm ci bersih di server
// Expo, terpisah dari node_modules lokal ini) — cuma bikin tsc lokal di sini
// tidak type-check API Mapbox secara detail. Aman dihapus kalau di lingkungan
// lain node_modules/@rnmapbox/maps sudah punya file .d.ts yang lengkap.
declare module '@rnmapbox/maps';

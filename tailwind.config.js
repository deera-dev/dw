/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Warna dark-palette tetap (tidak ikut ganti per akun) di-hardcode
        // langsung di sini (bukan CSS variable via vars()) karena ditemukan
        // di beberapa HP Android, resolusi CSS variable runtime NativeWind
        // kadang gagal (kemungkinan beda versi Hermes/react-native-css-interop
        // antar device) dan bikin `text-ink` dkk fallback ke warna default
        // (hitam) — padahal build & kode-nya identik di semua HP. Warna
        // hardcode di compile time seperti ini tidak bergantung ke resolusi
        // runtime sama sekali, jadi konsisten di semua device.
        ink: '#EDEDED',
        surface: '#0F1115',
        card: '#1B1E24',
        border: '#3C4048',
        subtle: '#8A8D94',
        danger: '#E5766D',
        success: '#6FCB74',
        muted: '#9AA0A8',
        // primary/primary-dark/primary-soft TETAP lewat CSS variable karena
        // memang beda tiap akun (Denny biru, Wulan rose) — nilainya di-set
        // dinamis lewat vars() di theme.ts berdasarkan siapa yang login.
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-soft': 'var(--color-primary-soft)',
      },
      fontFamily: {
        // Judul/header pakai Realistic Nature, teks biasa pakai Sleggie.
        title: ['RealisticNature'],
        body: ['Sleggie'],
      },
    },
  },
  plugins: [],
};

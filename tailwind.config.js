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
        // Semua lewat CSS variable (diset di theme.ts) supaya gampang ganti
        // skema terang/gelap dari satu tempat, tanpa harus edit tiap layar.
        ink: 'var(--color-ink)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        subtle: 'var(--color-subtle)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        muted: 'var(--color-muted)',
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

# Setup Notifikasi Push — Langkah Manual

Kode & infrastruktur server (Edge Function, cron, DB) sudah selesai dikerjakan.
Tiga langkah di bawah ini butuh akses/kredensial milikmu sendiri, jadi tidak
bisa dijalankan dari sini.

## 1. Install package notifikasi

Di terminal project (`D:\dev\dw-app`):

```
npx expo install expo-notifications expo-device expo-constants expo-dev-client
```

## 2. Simpan service role key ke Supabase Vault

Buka Supabase Dashboard → project **DW** → Project Settings → API → copy
**service_role secret** (bukan anon/publishable key).

Lalu buka SQL Editor di dashboard Supabase (bukan lewat Claude), dan jalankan
satu baris ini dengan key asli kamu:

```sql
select vault.create_secret('TEMPEL_SERVICE_ROLE_KEY_DI_SINI', 'service_role_key');
```

Cron job pengingat (tiap 5 menit) dan ringkasan pagi/malam sudah terpasang dan
menunggu secret ini — begitu baris di atas dijalankan, keduanya langsung aktif.

## 3. Build development client & install ke HP

Expo Go tidak mendukung push notification jarak jauh — perlu build sendiri:

```
npm install -g eas-cli
eas login
eas init
eas build --profile development --platform android
```

`eas init` otomatis menulis `projectId` ke `app.json` (dibutuhkan kode
`registerPushToken`). Setelah build selesai, EAS kasih link/QR untuk install
APK ke HP kamu — instal itu, bukan lewat Expo Go lagi.

Setelah ter-install, jalankan:

```
npx expo start --dev-client
```

dan buka lewat app development build yang baru diinstal (ikonnya beda dari
Expo Go). Login seperti biasa (`denny`/`wulan`) — push token otomatis
terdaftar begitu berhasil login.

Untuk iOS: proses sama, tapi build iOS lewat EAS butuh akun Apple Developer
Program berbayar. Kalau belum ada, mulai dari Android dulu tidak masalah.

## Yang sudah otomatis (tidak perlu disentuh)

- Edge Function `send-due-reminders` — cek tiap 5 menit, kirim push untuk
  pengingat berlabel "Mendesak".
- Edge Function `send-daily-digest` — kirim ringkasan jam 07:00 & 20:00 WIB
  untuk pengingat tidak mendesak, plus alert Tanggal Penting H-7/H-1/hari-H.
- `profiles.push_token` — terisi otomatis saat login dari HP dengan
  development build, dikosongkan lagi saat logout.

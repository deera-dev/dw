# PRD: DW (Denny & Wulan)
**Aplikasi pribadi untuk keluarga kecil — bukan produk komersial**

| | |
|---|---|
| **Nama Produk** | DW |
| **Untuk** | Denny (suami) & Wulan (istri) |
| **Platform** | iOS & Android |
| **Backend** | Supabase (org sudah ada) |
| **Versi Dokumen** | 2.6 — versi personal, MVP-focused + Analisa Data (rumus/aturan) + Rekomendasi Teknologi (feature-based, Tailwind, React Query, Zustand) + prinsip error handling & akuntabilitas berdua + Peta Berdua (lokasi realtime & pin tempat favorit) + daftar ide potensial |
| **Status** | Draft |

---

## 1. Tujuan Aplikasi

Satu aplikasi yang dipakai berdua oleh Denny & Wulan untuk mengelola kehidupan rumah tangga sehari-hari: keuangan, rencana makan, pengingat (obat/tagihan/tanggal penting), kesehatan, rencana kehamilan, dan rencana jalan-jalan berdua — supaya tidak lagi tersebar di ingatan, catatan manual, atau chat WhatsApp.

Ini bukan aplikasi untuk dirilis ke publik. Jadi tidak perlu fitur onboarding rumit, tidak perlu strategi retensi, tidak perlu skenario banyak pengguna — cukup **dipakai nyaman oleh dua orang**.

---

## 2. Masalah yang Ingin Diselesaikan

- Susah mengatur uang supaya cukup sampai akhir bulan, tidak ada catatan rapi.
- Bingung setiap hari mau makan apa — akhirnya order online/beli di luar tanpa rencana.
- Tidak ada rutinitas olahraga & pelacakan kesehatan.
- Data & rencana rumah tangga tidak tersinkron antara Denny & Wulan — masing-masing punya ingatan/catatan sendiri.
- Mudah lupa hal-hal penting (jadwal minum obat/vitamin, tagihan, tanggal penting) karena tidak ada satu tempat pengingat.
- Data sudah tercatat rapi di berbagai modul, tapi tidak ada yang "merangkum & menyorot" pola-pola penting — misalnya pengeluaran yang mulai membengkak atau tren berat badan yang perlu diperhatikan.

---

## 3. Prinsip Desain

1. **Cuma untuk 2 akun** — Denny & Wulan. Tidak perlu dirancang untuk banyak pengguna/keluarga lain.
2. **Semua data terlihat berdua** — tidak ada mode privat/view-only, semua bisa saling lihat & edit.
3. **Pengingat otomatis adalah kunci** — supaya aplikasi ini benar-benar dipakai tiap hari, bukan cuma dicoba sekali.
4. **Bangun bertahap, dipakai duluan sebelum ditambah fitur baru** — lihat pembagian MVP vs Tahap Lanjutan di bawah.
5. **Insight berbasis rumus/data sendiri, bukan AI eksternal** — fitur Analisa Data hanya menghitung & merangkum data yang Denny & Wulan catat sendiri, dibandingkan tabel referensi standar yang sudah baku (dipicu tombol/jadwal, bukan chat bebas), dan selalu jelas bahwa ini bukan pengganti nasihat profesional.
6. **Akuntabilitas berdua** — untuk modul yang punya target harian/rutin (hidrasi, olahraga, cek kesehatan mingguan, dll), progres masing-masing orang terlihat oleh pasangannya, bukan cuma diri sendiri. Kalau target belum tercapai menjelang batas waktu (mis. malam hari untuk target hidrasi harian), aplikasi menyorot status itu supaya Denny & Wulan bisa saling mengingatkan — bukan cuma pengingat sepihak dari sistem ke satu orang.
7. **Selalu tangani error dengan jelas, jangan pernah diam-diam gagal** — setiap pemanggilan ke Supabase (query, mutation, auth, realtime) wajib punya state `loading`/`error` yang benar-benar ditampilkan ke pengguna, bukan cuma dicatat di console. Tidak boleh ada layar yang macet tanpa penjelasan (mis. spinner berputar selamanya) — kalau ada operasi yang berpotensi menggantung (network lambat, sesi korup, dll), wajib diberi batas waktu (timeout) dan jalan keluar yang jelas (pesan error + opsi coba lagi/reset), supaya masalah langsung kelihatan dan gampang didiagnosis, bukan tersembunyi sebagai "loading terus".

---

## 4. Lingkup Fitur

### 🟢 MVP — Bangun & Pakai Duluan

Modul-modul ini yang membuat aplikasi langsung terasa berguna sehari-hari. Fokus di sini dulu sampai benar-benar dipakai rutin oleh Denny & Wulan.

#### 4.1 Dasbor Keluarga
Halaman utama, ringkasan semua modul aktif:
- Ringkasan Keuangan (saldo saat ini, pengeluaran bulan ini)
- Menu Hari Ini
- Pengingat/Jadwal Terdekat Hari Ini

#### 4.2 Pencatatan Keuangan
- Transaksi Baru (pemasukan/pengeluaran)
- Riwayat Transaksi
- Ringkasan Bulanan
- Kategori pengeluaran & pemasukan
- Ditandai siapa yang mencatat (Denny/Wulan)

#### 4.3 Perencana Makanan
- Catat Menu Harian (sarapan, siang, malam)
- Koleksi Resep favorit
- Cari Inspirasi Makan
- Rencana menu mingguan

#### 4.4 Kalender & Pengingat (serba guna)
- Tambah pengingat/jadwal bebas — bisa sekali atau berulang (harian/mingguan/bulanan/tahunan)
- Tampilan kalender (harian/mingguan/bulanan)
- Notifikasi tepat waktu untuk hal penting (obat, jadwal kontrol dokter, jatuh tempo tagihan)
- Ringkasan notifikasi 2x sehari (pagi & malam) untuk pengingat yang tidak mendesak, biar tidak numpuk notifikasi
- **Tanggal Penting**: tanggal lahir Denny, tanggal lahir Wulan, tanggal pernikahan/jadian, dan tanggal spesial lain — otomatis diingatkan tiap tahun (H-7, H-1, hari-H)
- **Pengingat rutin cek kesehatan**: default pengingat mingguan untuk timbang berat badan & cek tensi (misal tiap Senin pagi), bisa diubah jadwalnya sesuai kebutuhan

#### 4.5 Akun Bersama
- Login untuk Denny & Wulan (2 akun tetap, tidak perlu sistem invite yang rumit — cukup didaftarkan langsung oleh kalian berdua di awal)
- Semua data tersinkron real-time antar kedua akun

---

### 🔵 Tahap Lanjutan — Setelah MVP Dipakai Rutin

Modul-modul berikut bagus untuk ditambahkan, tapi bisa menyusul setelah kalian sudah nyaman pakai MVP di atas.

#### 4.6 Kesehatan & Kebugaran

**Data Tubuh**
- Catat Tinggi Badan (sekali diisi, bisa diupdate)
- Catat Berat Badan (rutin, dengan riwayat & grafik tren)
- **Hitung otomatis BMI (Indeks Massa Tubuh)** dari tinggi & berat badan terbaru, beserta kategorinya (kurus/normal/gemuk/obesitas — pakai standar Asia-Pasifik yang lebih sesuai untuk orang Indonesia)
- **Rentang berat badan ideal** dihitung otomatis berdasarkan tinggi badan (rentang BMI normal 18.5–22.9 dikonversi ke kg), jadi terlihat jelas "idealnya di angka berapa" dan "sekarang selisih berapa kg dari ideal"

**Tensi Darah**
- Catat hasil tensi dari rumah: sistol, diastol, dan nadi (jam & tanggal otomatis tercatat)
- Kategori otomatis berdasarkan angka yang dimasukkan (normal / meningkat / hipertensi tahap 1 / hipertensi tahap 2 / krisis hipertensi — mengikuti acuan umum AHA/Kemenkes)
- Riwayat & grafik tren tensi dari waktu ke waktu

**Catatan Kesehatan Lain** *(opsional, bisa ditambah bebas)*
- Gula darah
- Kolesterol
- Catatan bebas lain (misal keluhan, hasil cek lab)

**Olahraga**
- Catat Olahraga, Target & Progres
- Rekomendasi jenis olahraga harian sederhana

**Rekomendasi & Insight**
- Berdasarkan BMI, tensi, dan tren berat badan, aplikasi menampilkan insight sederhana (misal "BMI kamu 24.1 — kategori gemuk, idealnya turun ~4kg untuk masuk rentang normal" atau "Tensi terakhir 135/88 — kategori meningkat, coba kurangi garam & pantau rutin")
- **Disclaimer jelas**: semua angka & kategori ini bersifat informasi umum berdasarkan rumus standar, bukan diagnosis atau pengganti pemeriksaan tenaga medis — kalau ada angka yang mencurigakan/terus tidak normal, tetap perlu konsultasi ke dokter.

Semua data terlihat oleh Denny & Wulan berdua, ditandai siapa yang mencatat, supaya bisa saling memantau dan mengingatkan.

**Hidrasi**
- Catat Minum, Target Harian, Riwayat Hidrasi
- **Saling mengingatkan (akuntabilitas berdua, lihat §3 poin 6)**: progres minum air hari ini terlihat oleh pasangan (bukan cuma diri sendiri) di Dasbor/modul Kesehatan. Kalau menjelang malam target harian salah satu orang belum tercapai, statusnya disorot (mis. badge "Wulan baru 4/8 gelas") supaya pasangan bisa mengingatkan langsung — bukan cuma notifikasi sistem sepihak ke orang yang bersangkutan. Konsep akuntabilitas berdua yang sama berlaku juga untuk target olahraga & pengingat rutin cek kesehatan mingguan.

#### 4.7 Rencana Kehamilan
- Bisa diaktifkan/dinonaktifkan kapan saja lewat Pengaturan
- Tracker siklus/masa subur, catatan usia kehamilan & milestone
- Checklist perlengkapan & jadwal kontrol dokter/USG
- Kontak Darurat: nomor dokter/bidan & rumah sakit tujuan, plus daftar gejala yang perlu segera diperiksakan (bukan pengganti saran medis — cuma pengingat untuk segera hubungi dokter)

#### 4.8 Rencana Jalan-Jalan & Quality Time
- Daftar rencana jalan-jalan/date (destinasi, tanggal, anggaran)
- Wishlist tempat yang ingin dikunjungi berdua
- Checklist persiapan perjalanan
- Budget perjalanan terhubung otomatis ke modul Keuangan (kategori "Jalan-Jalan")
- Pengingat "waktunya quality time" kalau sudah lama tidak ada agenda berdua

#### 4.9 Tren & Insight
- Grafik sederhana di dashboard: tren pengeluaran bulanan, tren berat badan, jumlah quality time bulan ini

#### 4.10 Widget Home Screen
- Widget kecil di layar utama HP: sisa saldo, menu hari ini, atau pengingat terdekat — tanpa perlu buka aplikasi

#### 4.11 Pengaturan & Profil
- Profil (nama, tanggal lahir, tanggal pernikahan)
- Pengaturan notifikasi
- Aktifkan/nonaktifkan modul Kehamilan
- Ekspor data

#### 4.12 Analisa Data — Insight Personal *(baru)*

Fitur **analisa otomatis berbasis rumus/aturan (bukan AI)**, yang menghasilkan rangkuman & insight dari data yang sudah tercatat sendiri oleh Denny & Wulan di aplikasi (Keuangan, Kesehatan), dipicu tombol atau jadwal otomatis — hasilnya tampil sebagai kartu/teks singkat di Dasbor atau di masing-masing modul.

**Cara kerja:**
- Dihitung langsung dari data historis dengan rumus statistik sederhana: rata-rata, persentase perubahan bulan-ke-bulan, deteksi tren naik/turun beberapa entri terakhir, proyeksi sisa saldo (berdasarkan rata-rata pengeluaran harian dikali sisa hari di bulan berjalan).
- Kategori/insight kesehatan (BMI, tensi) memakai **tabel referensi standar yang sudah baku dan tidak berubah-ubah** (BMI Asia-Pasifik, kategori tensi AHA/Kemenkes — sama seperti yang sudah didefinisikan di §4.6), yang disimpan sebagai konstanta di aplikasi/backend, bukan diambil live dari internet setiap kali dianalisa. Ini membuat hasilnya konsisten, cepat, dan tidak tergantung koneksi ke layanan luar.

**Cara pemicu:**
- Tombol sekali-tekan di tiap modul, misal "Ringkas Bulan Ini" di halaman Keuangan atau "Lihat Tren" di halaman Kesehatan — hasilnya langsung tampil sebagai kartu insight.
- Opsional: analisa berjalan berkala (misal tiap awal bulan atau tiap Minggu malam) dan hasilnya muncul sebagai kartu baru di Dasbor, mirip notifikasi ringkasan.

**Ruang lingkup analisa** (dibatasi sengaja, sesuai keputusan produk):
- Data Keuangan: rangkuman pengeluaran ("bulan ini pengeluaran makan di luar naik 30% dibanding bulan lalu"), proyeksi sisa saldo sampai akhir bulan berdasarkan pola pengeluaran, kategori mana yang paling boros.
- Data Kesehatan: rangkuman tren berat badan/tensi ("tensi Wulan 3x terakhir cenderung naik, rata-rata 132/86"), kategori BMI/tensi berdasarkan tabel referensi standar, pengingat pola yang perlu diperhatikan.

**Yang secara sengaja TIDAK dilakukan:**
- Tidak ada kolom chat/tanya-jawab bebas — bukan chatbot, murni kartu hasil hitungan.
- Tidak memanggil AI/model bahasa eksternal apa pun — semua logika berupa rumus & aturan yang bisa dibaca/diaudit langsung dari kode, tidak ada biaya API berjalan.
- Tidak mengambil data live dari internet saat runtime — tabel referensi (BMI, tensi, dsb.) sudah dimuat di aplikasi dan hanya diperbarui manual kalau ada perubahan standar resmi (misal update pedoman Kemenkes).
- Tidak memberi diagnosis medis atau rekomendasi finansial yang mengikat — hanya insight deskriptif dari data sendiri dibandingkan tabel referensi.
- Tidak mengambil tindakan otomatis (tidak bisa transfer uang, ubah jadwal, dsb.) — murni menampilkan informasi & rangkuman, tindakan tetap manual oleh Denny/Wulan.

**Disclaimer** ditampilkan di setiap kartu insight: *"Analisa ini dihitung otomatis dari data yang kalian catat sendiri, dibandingkan dengan standar umum (BMI, tensi, dll.) — bukan pengganti nasihat dokter atau perencana keuangan profesional."*

**Catatan teknis:**
- Logika analisa ditulis sebagai fungsi/rumus biasa (bisa di klien React Native atau di Supabase Edge Function, dua-duanya cukup ringan) — tidak butuh API eksternal berbayar, tidak ada biaya per pemanggilan.
- Tabel referensi standar (kategori BMI, kategori tensi, dsb.) disimpan sebagai konstanta terpisah di kode, supaya gampang diperbarui kalau ada revisi pedoman resmi, tanpa mengubah logika analisa.
- Karena tidak bergantung pada data historis kompleks yang perlu "dipahami" AI, fitur ini bisa mulai berguna lebih cepat — cukup ada beberapa entri data (tidak perlu menunggu 4–6 minggu seperti versi berbasis AI sebelumnya), meski makin banyak data, makin akurat tren yang ditampilkan.

#### 4.13 Peta Berdua — Lokasi & Tempat Favorit *(baru)*

Satu peta bersama yang menggabungkan dua hal: tahu posisi pasangan secara realtime, dan menyimpan tempat-tempat penting berdua (bukan cuma untuk rencana jalan-jalan di §4.8, tapi juga tempat makan/nongkrong sehari-hari).

**Lokasi realtime**
- Lihat posisi Denny & Wulan di satu peta, ter-update realtime selama fitur ini diaktifkan.
- Bisa dimatikan kapan saja lewat Pengaturan oleh masing-masing orang (bukan default paksa nyala terus) — begitu dimatikan, posisi terakhir yang tersimpan cuma "terakhir terlihat di ... jam ...", tidak terus mengintai.
- Lokasi cuma dibagikan ke pasangan sendiri (bukan publik), konsisten dengan prinsip §3.2 "semua data terlihat berdua".

**Pin tempat penting**
- Simpan pin lokasi dengan kategori: tempat date, tujuan wishlist liburan (nyambung ke wishlist §4.8 — satu tempat bisa muncul di keduanya), resto/cafe favorit, dan kategori bebas lain (bisa nambah kategori sendiri).
- Tiap pin bisa dikasih nama, catatan singkat, dan foto (opsional).
- Semua pin kelihatan berdua di peta yang sama, bisa difilter per kategori (misal cuma tampilkan "resto favorit" saja) atau dilihat sebagai daftar (list view) buat yang tidak suka scroll peta.
- Tap pin buat lihat detail, arahkan ke aplikasi peta (Google Maps/Apple Maps) untuk navigasi — DW tidak perlu bikin routing sendiri, cukup jadi "buku alamat visual" berdua.

**Yang sengaja dibatasi:**
- Tidak bikin sistem navigasi/routing sendiri — cukup deep-link ke Google Maps/Apple Maps untuk arah jalan.
- Tidak melacak riwayat rute perjalanan (history jejak) — cuma posisi terkini/terakhir, bukan log pergerakan sepanjang hari.
- Lokasi tidak dibagikan ke siapa pun selain pasangan sendiri.

**Catatan teknis:**
- Lokasi realtime: `expo-location` untuk ambil koordinat + izin lokasi, disiarkan lewat Supabase Realtime (tabel `locations` berisi lat/lng/updated_at per akun, di-update berkala selagi fitur aktif, dibaca pasangan lewat subscription — pola yang sama dengan realtime sync modul lain di §5.1).
- Tampilan peta: `react-native-maps` (butuh development build EAS, tidak jalan penuh di Expo Go — konsisten dengan catatan notifikasi push di §5.1).
- Tabel `saved_places` untuk pin tempat (nama, kategori, lat/lng, catatan, foto opsional, dicatat oleh siapa) — RLS mengikuti pola tabel lain (§ pola RLS yang sudah dipakai: SELECT/UPDATE/DELETE untuk siapa pun yang login, INSERT dicek `created_by`).
- Baterai & privasi: update lokasi tidak perlu se-real-time GPS tracking aplikasi ojek online (misal tiap 1–2 menit saat foreground sudah cukup) — bukan aplikasi pelacakan presisi tinggi, cukup untuk tahu "pasangan lagi di sekitar mana".

---

## 5. Catatan Teknis

- **Backend: Supabase** — dipakai untuk database, autentikasi (login Denny & Wulan), dan sinkronisasi data real-time antar 2 akun.
- Karena hanya 2 pengguna tetap, autentikasi bisa dibuat sederhana (email/password untuk masing-masing), tidak perlu sistem invite/kode yang rumit.
- Data disimpan di Supabase — pastikan project di-set private (tidak ada akses publik ke tabel), cukup diamankan dengan Row Level Security (RLS) supaya hanya akun Denny & Wulan yang bisa akses data masing-masing.
- Karena data keuangan & kehamilan cukup pribadi, gunakan password yang kuat untuk akun Supabase dan akun aplikasi — tidak perlu enkripsi tingkat enterprise, cukup kebiasaan keamanan yang wajar.
- **Analisa Data (4.12)**: logika rumus/aturan dijalankan dari backend/aplikasi dengan data yang diambil langsung dari Supabase saat itu juga (bukan disimpan terpisah); tabel referensi standar (BMI, tensi, dll.) disimpan sebagai konstanta di kode, bukan dipanggil dari layanan luar.
- **Error handling (lihat §3 poin 7)**: setiap pemanggilan Supabase (query/mutation/auth/realtime) harus mengekspos state error yang ditampilkan ke UI, dilengkapi timeout untuk operasi yang berisiko menggantung (mis. pengecekan sesi saat app dibuka), dan punya jalan pemulihan yang jelas (retry, pesan error, atau reset sesi) — bukan gagal diam-diam.

---

## 5.1 Rekomendasi Teknologi

Dipilih dengan prioritas: **cepat dibangun oleh tim kecil/personal, satu codebase untuk iOS & Android, dan selaras dengan Supabase yang sudah ada.**

| Kebutuhan | Rekomendasi | Alasan |
|---|---|---|
| **Framework Mobile** | React Native + Expo | Satu codebase untuk iOS & Android, ekosistem besar, gampang setup push notification & build tanpa perlu native project terpisah di awal. Cocok untuk proyek personal 2 pengguna. |
| **Bahasa** | TypeScript | Meminimalkan bug saat menambah modul baru (keuangan, kesehatan, dll punya banyak field numerik/tanggal — tipe data jelas membantu). |
| **State & Data Fetching** | TanStack Query (React Query) untuk server state + Zustand untuk UI state | React Query untuk semua data dari Supabase (cache, refetch, invalidation setelah insert/update). Zustand khusus state lokal seperti buka/tutup modal & isi form yang sedang diketik — bukan tempat data bisnis. Tidak perlu Redux, terlalu berat untuk skala aplikasi ini. |
| **Styling** | Tailwind (via NativeWind v4) | ClassName langsung di komponen React Native, konsisten dengan workflow Tailwind di web. Dikonfigurasi lewat `tailwind.config.js` + `babel.config.js` + `metro.config.js`. |
| **Struktur Kode** | Feature-based (`src/features/<nama-fitur>/...`) | Tiap modul PRD (keuangan, kalender, perencana makan, dst.) jadi satu folder mandiri berisi `api.ts` (pemanggilan Supabase), `hooks/` (React Query), `store/` (Zustand bila perlu), `screens/`, `components/`. `src/shared/` untuk yang lintas fitur (klien Supabase, tipe database). Memudahkan kalau nanti modul Tahap Lanjutan (Kesehatan, Kehamilan, dst.) ditambah satu per satu tanpa mengganggu fitur lain. |
| **Backend & Database** | Supabase (Postgres) | Sudah ditetapkan di §1 — dipakai untuk DB, Auth, Realtime sync antar 2 akun, dan Storage (foto struk/resep). |
| **Autentikasi** | Supabase Auth (email/password) | Sesuai §5, cukup 2 akun tetap tanpa sistem invite. |
| **Realtime Sync** | Supabase Realtime (Postgres changes) | Supaya perubahan data oleh Denny langsung muncul di HP Wulan tanpa refresh manual — penting untuk prinsip desain "semua data terlihat berdua". |
| **Row Level Security** | Supabase RLS policies | Wajib diaktifkan dari awal (§5) supaya data tetap privat meski project di-host di cloud publik. |
| **Notifikasi Push** | Expo Notifications + Supabase Edge Function (scheduler) | Untuk pengingat obat/tagihan/tanggal penting (§4.4) dan ringkasan 2x sehari. Edge Function di-trigger oleh cron job (`pg_cron` di Supabase) untuk cek jadwal & kirim notifikasi. Catatan realita implementasi: notifikasi lokal (dijadwalkan di HP) bisa jalan di Expo Go; notifikasi push jarak jauh (lewat Expo Push Service + Edge Function) butuh development build (`expo-dev-client`/EAS Build), tidak didukung penuh di Expo Go. |
| **Analisa Data** | Logika rumus/aturan biasa, dijalankan di **Supabase Edge Function** (atau langsung di klien) | Tidak butuh API AI eksternal — cukup fungsi kalkulasi (rata-rata, % perubahan, deteksi tren) plus tabel referensi standar (BMI, tensi) yang di-hardcode. Lebih murah, lebih cepat, dan hasilnya konsisten/bisa diaudit dari kode. |
| **Grafik & Tren** | Victory Native atau `react-native-svg-charts` | Untuk grafik tren pengeluaran, berat badan, tensi (§4.6, §4.9) — ringan dan cukup untuk grafik garis/bar sederhana. |
| **Kalender** | `react-native-calendars` | Untuk tampilan kalender harian/mingguan/bulanan di §4.4. |
| **Peta & Lokasi** | `react-native-maps` + `expo-location` | Untuk peta lokasi realtime & pin tempat favorit (§4.13). Posisi disiarkan lewat Supabase Realtime, bukan layanan pelacakan pihak ketiga. Butuh development build (sama seperti catatan notifikasi push), tidak jalan penuh di Expo Go. |
| **Widget Home Screen** | Expo Config Plugin + native widget (WidgetKit untuk iOS, App Widget untuk Android) | Ini satu-satunya bagian yang butuh sedikit kode native tambahan di luar Expo managed workflow — baru dikerjakan saat sampai §4.10, bukan di awal. |
| **Build & Distribusi** | Expo Application Services (EAS Build) | Build iOS & Android tanpa perlu Mac fisik untuk iOS, dan cukup mudah untuk distribusi terbatas (TestFlight/APK langsung) ke 2 orang saja — tidak perlu rilis ke App Store/Play Store publik. |
| **Hosting** | Tidak perlu server terpisah | Supabase sudah meng-cover DB + Auth + Edge Functions; aplikasi mobile langsung konek ke Supabase, tidak ada backend custom yang perlu di-maintain sendiri. |

**Catatan urutan implementasi:** karena ini proyek personal dengan waktu terbatas, Supabase (DB + Auth + RLS) dan React Native/Expo dasar sebaiknya disiapkan di awal sekali sebelum modul MVP (§4.1–4.5) dibangun, supaya semua modul berikutnya tinggal nambah tabel & layar tanpa mengubah fondasi.

---

## 6. User Stories

1. Sebagai Denny/Wulan, saya ingin langsung melihat ringkasan keuangan begitu buka aplikasi.
2. Sebagai Denny/Wulan, saya ingin mencatat pemasukan/pengeluaran dengan cepat dan pasangan saya bisa langsung lihat.
3. Sebagai Denny/Wulan, saya ingin dapat pengingat otomatis (obat, tagihan, tanggal penting) tanpa harus mengingat sendiri.
4. Sebagai Denny/Wulan, saya ingin lihat inspirasi menu harian supaya tidak selalu bingung mau makan apa.
5. Sebagai Denny/Wulan, saya ingin mencatat rencana jalan-jalan berdua lengkap dengan budgetnya (tahap lanjutan).
6. Sebagai Denny/Wulan, saya ingin mencatat perkembangan kehamilan kalau sedang program hamil/hamil (tahap lanjutan).
7. Sebagai Denny/Wulan, saya ingin menekan satu tombol dan langsung dapat rangkuman/insight singkat soal keuangan atau kesehatan kami, tanpa harus buka & bandingkan data manual satu-satu (tahap lanjutan).
8. Sebagai Denny/Wulan, saya ingin tahu kalau pasangan saya belum mencapai target harian (mis. minum air, olahraga) supaya saya bisa mengingatkan langsung, bukan cuma sistem yang mengingatkan satu arah.

---

## 7. Yang Sengaja Tidak Dibuat

- Tidak perlu sistem multi-keluarga atau lebih dari 2 akun.
- Tidak perlu mode "hanya lihat" (view-only) — semua data bisa diedit berdua.
- Tidak perlu integrasi otomatis ke rekening bank — transaksi dicatat manual dulu.
- Tidak perlu konsultasi dokter di dalam aplikasi.
- Tidak perlu analytics/tracking pemakaian — ini bukan produk yang perlu diukur retensinya.
- Analisa Data tidak dirancang sebagai chatbot/kolom tanya-jawab bebas dan tidak memakai AI/model bahasa eksternal — sengaja dibatasi hanya pada rumus & tabel referensi standar dari data sendiri, dipicu tombol/jadwal (lihat 4.12), bukan pengganti nasihat profesional medis/finansial.

---

## 8. Ide Potensial — Belum Diputuskan

Beberapa ide tambahan yang muncul selagi mengembangkan aplikasi ini, dicatat di sini dulu supaya tidak hilang, tapi belum masuk komitmen fitur resmi seperti §4. Baru dipindah ke §4 kalau memang mau dibangun.

- **Daftar belanja bersama**: list belanja sederhana yang terhubung ke Perencana Makanan (§4.3) — pas nyusun menu mingguan, bahan yang belum ada di rumah bisa langsung masuk daftar belanja, dicentang berdua saat sudah dibeli.
- **Jurnal harian singkat berdua**: satu catatan singkat/hari (teks atau foto) buat nyimpen momen kecil sehari-hari — semacam "buku harian" ringan, bukan media sosial, cuma buat berdua.
- **Kalkulator "siapa nombokin siapa"**: pencatatan kecil kalau salah satu titip bayar/talangin sesuatu buat yang lain, biar tidak lupa dan tidak perlu diingat-ingat manual.
- **Toggle tema terang/gelap manual**: sekarang aplikasi di-set dark mode permanen sesuai preferensi kalian, tapi bisa ditambah saklar di Pengaturan buat pindah ke tema terang kapan saja tanpa perlu ubah kode lagi.
- **Backup data terjadwal**: selain ekspor manual (§4.11), backup otomatis berkala (mis. tiap awal bulan) ke email atau penyimpanan cloud kalian sendiri, sebagai jaga-jaga di luar data yang sudah ada di Supabase.
- **Pengingat kado & momen spesial**: perluasan dari Tanggal Penting (§4.4) — begitu tanggal spesial mendekat, aplikasi bisa nawarin "mau siapkan kado/kejutan?" dan kalau diisi anggarannya bisa otomatis nyambung ke Keuangan seperti pola di §4.8.
- **Lencana kecil konsistensi**: pengakuan ringan (bukan gamifikasi berlebihan) untuk hal-hal seperti "7 hari berturut-turut checklist olahraga selesai" — cukup ditampilkan sebagai teks/badge kecil di modul terkait, bukan sistem poin/leaderboard.

---

## 9. Ringkasan Insight dari Riset Awal

| Pertanyaan | Insight |
|---|---|
| Aksi terpenting saat pertama buka | Lihat ringkasan keuangan |
| Fitur wajib | Catat pemasukan & pengeluaran, resep masakan favorit, catat olahraga & berat badan, pengingat minum air, catat menu makan harian |
| Alasan pakai dibanding cara manual | Bisa dipakai berdua |
| Alasan tetap dipakai tiap hari | Pengingat otomatis |

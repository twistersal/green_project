# Green Project

Green Project adalah aplikasi PWA planner dan tracker untuk kesehatan, kebugaran, dan olahraga. Aplikasi ini membantu menyusun aktivitas untuk hari ini maupun tanggal mendatang, lalu mencatat pelaksanaannya melalui checklist.

## Fitur Utama

Planner menyediakan kalender pemilihan tanggal, formulir rencana aktivitas, jam, catatan, dan checklist pelaksanaan. Tanggal yang memiliki rencana diberi penanda pada kalender, sedangkan tanggal yang memiliki aktivitas selesai memakai penanda yang lebih terang.

Sistem streak dihitung dari hari berurutan yang memiliki sedikitnya satu aktivitas selesai. Api streak menggunakan empat suasana visual: putih-hijau untuk awal perjalanan hingga tiga hari, hijau neon mulai tujuh hari, dark green neon pada milestone 50 hari, dan dark green white neon mulai 100 hari serta kelipatannya.

Modul pendamping tetap mencakup pencatatan sesi olahraga, hidrasi, jam tidur, dan suasana hati. Data utama disimpan pada `localStorage`, sehingga aplikasi dapat digunakan tanpa akun dan tanpa server.

## Menjalankan Secara Lokal

```bash
pnpm install
pnpm dev
```

Untuk memeriksa tipe dan membuat build produksi:

```bash
pnpm check
pnpm build
```

Hasil build berada di `dist/`. Manifest PWA dan service worker tersedia di `client/public/`.

## Struktur Penting

| Lokasi | Peran |
|---|---|
| `client/src/pages/Home.tsx` | Dashboard, kalender planner, checklist, streak, latihan, dan kesehatan |
| `client/src/index.css` | Tema Obsidian Emerald, layout, kalender, kartu, animasi, dan responsivitas |
| `client/public/manifest.webmanifest` | Identitas instalasi Green Project |
| `client/public/sw.js` | Cache offline |
| `client/index.html` | Metadata browser dan ikon aplikasi |

## Data Lokal

Data aplikasi disimpan pada perangkat pengguna dengan key `green-project-planner-v1`. Data lama dari MVP Raga Hijau dibaca sekali sebagai fallback agar catatan yang sudah ada tidak langsung hilang ketika aplikasi diperbarui.

## Catatan GitHub Pages

Jika repositori ini dipakai untuk GitHub Pages pada subpath, build perlu menggunakan base path sesuai nama repositori. Contoh:

```bash
GITHUB_ACTIONS=true VITE_BASE_PATH=/green_project/ pnpm build
```

# Validasi GitHub Pages — Repositori Ruang Tumbuh

| Area | Hasil |
| --- | --- |
| Repositori | Kode PWA berada pada branch `pwa-web` di `twistersal/ruang-tumbuh`; branch `main` aplikasi Expo tidak ditimpa. |
| Branch publik | Build web PWA tersedia pada branch `gh-pages`. |
| Konfigurasi Pages | GitHub Pages menggunakan sumber `gh-pages` dengan folder root. |
| Routing | Router menggunakan base path GitHub Pages sehingga URL `/ruang-tumbuh/` dirender sebagai beranda aplikasi. |
| URL publik | `https://twistersal.github.io/ruang-tumbuh/` merespons HTTP 200 dan build terbaru dapat diverifikasi dengan query cache baru. |

Catatan: CDN GitHub Pages menyimpan HTML root hingga beberapa menit. Bila 404 lama masih terlihat, muat ulang paksa atau buka URL dengan parameter cache baru sekali; setelah cache kedaluwarsa URL utama akan memakai build terbaru.

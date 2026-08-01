# 🚀 Panduan Deploy Frontend (Vercel)

Panduan deploy admin dashboard (Next.js) ke Vercel, dari nol sampai jalan.

> Frontend ini **auto-deploy**: setiap push ke branch `main` di GitHub
> ([barryarfh29/FrontendVCS](https://github.com/barryarfh29/FrontendVCS))
> otomatis memicu build & deploy production di Vercel. Tidak perlu deploy manual.

---

## Arsitektur Singkat

```
[Frontend Vercel] ──HTTPS──► [API Bot di VPS :8080] ──► [MongoDB Atlas]
```

Frontend hanya butuh **satu** konfigurasi: env var `NEXT_PUBLIC_API_URL`
yang menunjuk ke API bot di VPS.

---

## 1. Setup dari Nol (kalau ganti akun Vercel / project baru)

1. Login ke [vercel.com](https://vercel.com) (bisa pakai akun GitHub)
2. **Add New → Project** → Import repo `barryarfh29/FrontendVCS`
3. Framework terdeteksi otomatis: **Next.js** — biarkan default (build command & output tidak perlu diubah)
4. Sebelum klik Deploy, buka bagian **Environment Variables** dan tambahkan:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://IP-VPS.sslip.io` (alamat API bot saat ini) |

5. Klik **Deploy** → tunggu sampai status **Ready**

## 2. Update Alamat API (saat ganti VPS)

1. Dashboard Vercel → project → **Settings → Environments → Production**
2. Bagian **Environment Variables** → edit `NEXT_PUBLIC_API_URL` → isi URL VPS baru
3. **Redeploy**: tab **Deployments** → ⋯ pada deployment teratas → **Redeploy**

> ⚠️ Redeploy **wajib** setiap kali env var berubah — Next.js membake nilai
> `NEXT_PUBLIC_*` saat build, bukan saat runtime.

## 3. Update Kode / Fitur Baru

Cukup push ke GitHub, Vercel deploy sendiri:

```bash
git add -A
git commit -m "pesan perubahan"
git push origin main
```

Pantau progress build di tab **Deployments**.

## 4. Jalankan Lokal (Development)

```bash
npm install
```

Buat file `.env.local` (contoh ada di `.env.example`):

```env
NEXT_PUBLIC_API_URL=https://IP-VPS.sslip.io
```

Lalu:

```bash
npm run dev
# buka http://localhost:3000
```

---

## Halaman yang Tersedia

| Route | Fungsi |
|---|---|
| `/` | Dashboard |
| `/templates` | Edit template pesan bot |
| `/talents` | Daftar talent & status |
| `/activities` | Activity Log — riwayat semua kegiatan bot (backup MongoDB) |
| `/settings` | Pengaturan harga, durasi, kurs MYR |

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Halaman kosong / "Failed to fetch" | Cek `NEXT_PUBLIC_API_URL` benar & API VPS hidup (buka URL-nya langsung di browser) |
| Data tidak muncul setelah ganti env var | Belum Redeploy — env var dibake saat build |
| Build gagal di Vercel | Cek log build di tab Deployments; tes lokal dengan `npx next build` |
| 401 Unauthorized dari API | Token admin di `src/lib/api.ts` harus cocok dengan admin ID yang terdaftar di bot |
| Deploy tidak terpicu setelah push | Pastikan push ke branch `main` & repo masih terhubung di Settings → Git |

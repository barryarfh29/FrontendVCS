# Telegram Bot Admin Dashboard

Admin dashboard untuk manage bot Telegram streaming. Built with Next.js 14, Tailwind CSS, dan TipTap editor.

## Features

- **Rich Message Editor** — Edit 7 template pesan bot dengan visual editor (heading, table, bold, paragraph, divider)
- **Telegram Preview** — Preview pesan seperti tampilan di Telegram
- **Dashboard** — Ringkasan transaksi, talent status, dan recent activity
- **Talent Management** — List talent dengan status online/offline
- **Dark Theme** — UI gelap mirip Telegram dark mode

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS
- TipTap (rich text editor)
- Lucide Icons

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local and set your API URL
# NEXT_PUBLIC_API_URL=https://your-api-url.com

# Run development server
npm run dev
```

## Deploy to Vercel

1. Push repo ke GitHub
2. Connect repo di [vercel.com](https://vercel.com)
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = URL backend API kamu (yang expose port 8080 dari EasyPanel)
4. Deploy

## API Endpoints

Dashboard ini connect ke REST API backend dengan endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/templates | List semua templates |
| GET | /api/templates/:key | Get 1 template |
| PUT | /api/templates/:key | Update template |
| GET | /api/talents | List semua talent |
| GET | /api/settings | Get bot settings |
| GET | /api/transactions | Get 50 transaksi terakhir |

## Authentication

Header: `Authorization: Bearer <admin_user_id>`

Admin user ID saat ini di-hardcode: `1060831854`

## Template Keys

| Key | Description | Variables |
|-----|-------------|-----------|
| welcome | Halaman pilih talent | — |
| payment | Invoice QRIS | {invoice_id}, {talent_name}, {duration}, {nominal} |
| paid | Pembayaran diterima | — |
| connecting | Menghubungi talent | {talent_name} |
| session_ready | Sesi siap | {talent_name}, {duration} |
| session_end | Sesi berakhir | — |
| talent_full | Talent full | {talent_name} |

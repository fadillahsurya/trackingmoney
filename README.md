# Keuangan Bersama

Keuangan Bersama adalah PWA private untuk mencatat keuangan bersama pasangan dalam satu household maksimal 2 user. Aplikasi hanya menyimpan data shared finance: kontribusi dana bersama, pengeluaran bersama, budget bulanan, transaksi rutin, dan target tabungan bersama.

Tidak ada fitur personal income, tidak ada tabel income pribadi, dan tidak ada dashboard gaji pasangan.

## Fitur Utama

- Auth login, register, logout dengan Supabase Auth
- Household maksimal 2 anggota dengan invite code
- CRUD transaksi bersama
- Budget bulanan dan kalkulasi aman sampai akhir bulan
- Dashboard status keuangan, grafik harian, dan grafik kategori
- Transaksi rutin bulanan dengan log paid/skipped agar tidak double input
- Target tabungan bersama dan kontribusi tabungan
- PWA sederhana untuk Add to Home Screen

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth dan Postgres
- Supabase Row Level Security
- Recharts
- Vercel

## Environment Variables

Buat `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Jangan gunakan service role key di client. Jangan commit secret key.

Untuk Vercel, masukkan variable yang sama di **Project Settings > Environment Variables**.

## Setup Local

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

Route utama:

```text
/login
/register
/app/dashboard
/app/transactions
/app/recurring
/app/savings
/app/settings
```

## Setup Supabase

1. Buka Supabase Dashboard.
2. Pilih project.
3. Buka SQL Editor.
4. Buka file `supabase/migrations/202605260001_initial_schema.sql`.
5. Copy seluruh isi file SQL, bukan path filenya.
6. Paste ke SQL Editor.
7. Klik Run.

File migration membuat tabel, RLS policies, seed helper kategori default, RPC join household, RPC recurring paid/skipped, dan RPC kontribusi tabungan.

## Deploy Vercel

1. Push repo ke GitHub.
2. Import project di Vercel.
3. Isi environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy.
5. Pastikan Supabase Auth URL configuration mengizinkan domain Vercel.

## Catatan Security

- RLS aktif di semua tabel household.
- Query aplikasi selalu berdasarkan household aktif.
- Service role key tidak digunakan di browser.
- Income pribadi tidak disimpan.
- Data household lain tidak boleh terbaca oleh user yang bukan member.

## QA

Checklist manual tersedia di:

```text
docs/QA_CHECKLIST.md
```

## Roadmap Singkat

- Kategori custom penuh
- Notifikasi webhook
- PWA offline ringan
- Penyempurnaan laporan bulanan

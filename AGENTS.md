# AGENTS.md

## Project Overview

Project ini adalah aplikasi web PWA untuk pencatatan keuangan bersama pasangan.

Aplikasi dibuat untuk kebutuhan pribadi, maksimal 2 user dalam 1 household. Fokus utama aplikasi adalah mengelola keuangan bersama, bukan keuangan pribadi penuh.

Stack utama:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel
- Recharts
- PWA

Aplikasi harus mobile-first agar nyaman digunakan di Android dan iOS melalui fitur “Add to Home Screen”.

---

## Core Product Principle

Aplikasi ini harus menjaga privasi income pribadi.

Jangan membuat fitur untuk:
- Menyimpan income pribadi user
- Menampilkan income pribadi pasangan
- Membandingkan gaji/income pribadi
- Melihat detail transaksi pribadi yang bukan transaksi bersama

Yang boleh dicatat:
- Pengeluaran bersama
- Kontribusi ke dana bersama
- Kontribusi ke tabungan bersama
- Transaksi rutin bersama
- Budget bulanan bersama
- Target tabungan bersama

Prinsip penting:
Jika data tidak perlu disimpan, jangan disimpan.

---

## Main Users

Aplikasi digunakan oleh 2 user:
- User pertama
- Pasangan user pertama

Keduanya tergabung dalam 1 household.

Setiap user login menggunakan Supabase Auth.

Data yang dibagikan adalah data household/shared finance saja.

---

## MVP Features

### Authentication

- Login
- Register
- Logout
- Supabase Auth
- Protected route untuk semua halaman /app

### Household

- 1 household maksimal 2 anggota
- Owner dapat membuat household
- Pasangan dapat join dengan invite code
- Semua data transaksi terhubung ke household_id

### Shared Transactions

Jenis transaksi:

- contribution
- expense
- saving_contribution

Contribution menambah dana bersama.
Expense mencatat pengeluaran bersama.
Saving contribution menambah tabungan bersama.

Field penting:
- household_id
- created_by
- paid_by
- type
- amount
- category_id
- description
- transaction_date

### Categories

Kategori default:
- Makan
- Transport
- Belanja Rumah
- Tagihan
- Hiburan
- Kesehatan
- Lainnya

User boleh membuat kategori tambahan.

### Monthly Budget

Budget bulanan dipakai untuk:
- Menghitung sisa budget
- Menghitung status keuangan
- Menghitung batas aman per hari sampai akhir bulan

### Recurring Transactions

Recurring transaction dipakai untuk tagihan atau transaksi rutin.

Contoh:
- Internet
- Listrik
- Air
- Sewa
- Iuran
- Langganan
- Tabungan rutin

Untuk MVP, recurring tidak otomatis membuat transaksi.
User harus klik “Tandai sudah dibayar”.

Harus ada mekanisme log agar recurring tidak tercatat dua kali pada bulan yang sama.

### Saving Goals

Fitur tabungan bersama.

User dapat:
- Membuat target tabungan
- Melihat progress
- Menambah kontribusi tabungan
- Melihat target amount dan current amount

Jika ada kontribusi tabungan, catat juga sebagai shared transaction dengan type saving_contribution.

### Dashboard

Dashboard harus sederhana, visual, dan mudah dipahami orang awam.

Tampilkan:
- Total dana bersama bulan ini
- Total pengeluaran bersama bulan ini
- Sisa budget
- Batas aman harian sampai akhir bulan
- Mood/status keuangan
- Progress tabungan
- Grafik pengeluaran harian
- Grafik kategori pengeluaran
- Reminder recurring yang belum dibayar

### Mood / Financial Status

Gunakan status:
- Aman
- Waspada
- Kritis
- Melebihi Batas

Status harus dihitung dari:
- Budget terpakai
- Progress tanggal dalam bulan berjalan
- Apakah budget sudah terlampaui

Pesan harus ramah dan mudah dipahami.

Contoh:
- “Aman. Pengeluaran bersama masih terkendali.”
- “Waspada. Pengeluaran bulan ini lebih cepat dari ritme aman.”
- “Kritis. Budget hampir habis sebelum akhir bulan.”
- “Melebihi batas. Pengeluaran bersama sudah melewati budget bulan ini.”

### Aman Sampai Akhir Bulan

Formula:
remainingBudget / remainingDaysInMonth

Tampilkan dalam bahasa Indonesia:
“Agar tetap aman sampai akhir bulan, pengeluaran bersama sebaiknya tidak lebih dari RpX per hari.”

---

## UI/UX Rules

- Mobile-first
- Bahasa Indonesia
- Simple and friendly
- Cocok untuk orang awam
- Hindari tampilan terlalu teknis
- Gunakan card dan visual indicator
- Gunakan progress bar
- Gunakan badge status
- Gunakan grafik secukupnya
- Format uang dalam Rupiah
- Empty state harus jelas
- Form harus pendek dan mudah diisi

Contoh label:
- Dashboard
- Catat
- Transaksi Rutin
- Tabungan Bersama
- Pengaturan
- Catat Pengeluaran
- Tambah Kontribusi
- Aman Sampai Akhir Bulan
- Status Bulan Ini

---

## Recommended Routes

- /login
- /register
- /app/dashboard
- /app/transactions
- /app/transactions/new
- /app/recurring
- /app/savings
- /app/settings
- /app/settings/budget
- /app/settings/categories
- /app/settings/household

All /app routes must be protected.

---

## Recommended Folder Structure

src/
  app/
  components/
  components/ui/
  features/
    auth/
    dashboard/
    transactions/
    recurring/
    savings/
    settings/
  lib/
    supabase/
    utils/
    calculations/
  types/

---

## Database Tables

Required tables:

- profiles
- households
- household_members
- categories
- shared_transactions
- monthly_budgets
- recurring_transactions
- recurring_transaction_logs
- saving_goals
- notification_settings

All tables containing household data must include household_id.

Enable Row Level Security on all relevant tables.

---

## Supabase Security Rules

RLS is mandatory.

Rules:
- User can only access household where user is a member.
- User can only create/update/delete shared data for household where user is a member.
- User cannot access another household.
- User cannot see private income because private income table must not exist.

---

## Coding Rules

- Use TypeScript strict mode.
- Avoid any.
- Prefer reusable components.
- Keep business logic in helper files.
- Keep UI components clean.
- Use server components where appropriate.
- Use client components only when needed for forms, charts, and interactivity.
- Use Zod for validation if forms become complex.
- Use React Hook Form if needed.
- Use Recharts for charts.
- Use shadcn/ui for UI primitives.
- Use Tailwind CSS for styling.
- Use Indonesian labels in UI.
- Format currency with Intl.NumberFormat for IDR.
- Handle loading, error, and empty states.

---

## Calculation Helpers

Create helper functions for:

- formatCurrencyIDR()
- getCurrentMonthRange()
- getDaysInMonth()
- getRemainingDaysInMonth()
- calculateMonthlyExpense()
- calculateRemainingBudget()
- calculateSafeDailySpend()
- calculateBudgetUsagePercentage()
- calculateMonthProgressPercentage()
- calculateFinancialMood()
- groupExpensesByDate()
- groupExpensesByCategory()

---

## Financial Mood Logic

Suggested logic:

If totalExpense > monthlyBudget:
  status = "Melebihi Batas"

Else compare budgetUsagePercentage to monthProgressPercentage:

- If usage <= monthProgress + 10:
  status = "Aman"
- If usage <= monthProgress + 25:
  status = "Waspada"
- If usage > monthProgress + 25:
  status = "Kritis"

Also handle cases:
- No budget set
- No transactions
- Month just started
- Remaining days is 0

---

## PWA Requirements

The app should be installable on mobile.

Add:
- manifest
- app icons placeholder
- theme color
- responsive viewport
- mobile-first layout

The app does not need complex offline mode for MVP.

---

## Notification / Webhook Preparation

For MVP, only prepare structure.

Create notification_settings table.

Create helper/service placeholder:
- checkBudgetStatus()
- shouldSendDailyAlert()
- shouldSendMonthlyAlert()
- sendWebhookNotification()

Actual webhook sending can be implemented later.

---

## Do Not Build Yet

Do not build these features in MVP unless explicitly requested:

- Personal income tracking
- Personal expense tracking
- Bank sync
- OCR receipt
- AI financial advisor
- Complex split bill
- Multi-household
- Multi-currency
- Investment tracking
- PDF report
- Full accounting system

---

## Final Goal

Build a clean, private, mobile-first shared finance PWA for a couple.

The product should help users answer:

- Uang bersama bulan ini masih aman atau tidak?
- Pengeluaran bersama paling banyak di kategori apa?
- Berapa batas aman belanja per hari sampai akhir bulan?
- Tagihan rutin apa yang belum dibayar?
- Target tabungan bersama sudah sampai mana?
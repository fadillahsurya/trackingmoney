# CLAUDE.md

## Role

You are assisting in building a private shared-finance PWA for a couple.

You should act as:
- Senior full-stack engineer
- Product-minded UI/UX designer
- Supabase/Postgres advisor
- Mobile-first frontend engineer

The app must be simple, private, and easy to understand for non-technical users.

---

## Product Summary

This project is a shared finance tracker for a couple.

The application is not a full personal finance app.

It tracks only:
- Shared expenses
- Contributions to shared funds
- Shared saving goals
- Recurring shared transactions
- Monthly shared budget
- Financial health status

It must not track or expose personal income.

---

## Privacy Rule

The most important rule:

Do not create personal income tracking.

Do not store private income.
Do not display partner income.
Do not compare private income.
Do not add personal finance dashboards unless explicitly requested later.

The app should only record money that enters the shared household context as a contribution.

Example:
Allowed:
“Fadil contributed Rp1.500.000 to shared funds.”

Not allowed:
“Fadil salary is Rp8.000.000.”

---

## Tech Stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Recharts
- Vercel
- PWA

The application should be deployable to Vercel.

The database should be Supabase Postgres.

Authentication should use Supabase Auth.

---

## Language

The UI must use Indonesian.

Use friendly Indonesian labels.

Examples:
- Dashboard
- Catat
- Transaksi
- Transaksi Rutin
- Tabungan Bersama
- Pengaturan
- Catat Pengeluaran
- Tambah Kontribusi
- Aman Sampai Akhir Bulan
- Status Bulan Ini
- Sisa Budget
- Budget Bulanan
- Sudah Dibayar
- Lewati Bulan Ini

Code comments may use English or Indonesian, but UI text should be Indonesian.

---

## Design Direction

The app is mobile-first.

Prioritize:
- Simple cards
- Clear numbers
- Friendly financial status
- Progress bars
- Easy forms
- Bottom navigation
- Minimal table usage on mobile

The dashboard should be readable in under 10 seconds.

Use visual status:
- Aman
- Waspada
- Kritis
- Melebihi Batas

Use icons and badges where helpful.

Avoid complex accounting terms.

---

## Required Pages

Create the following pages:

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

## Main Navigation

Recommended bottom navigation:

- Home
- Catat
- Rutin
- Tabungan
- Setting

Use mobile-friendly navigation.

Desktop layout can be simple.

---

## Database Tables

Use these tables:

### profiles
Stores user profile.

### households
Stores shared household.

### household_members
Connects users to household.

### categories
Stores transaction categories.

### shared_transactions
Stores shared financial transactions.

Types:
- contribution
- expense
- saving_contribution

### monthly_budgets
Stores household monthly budget.

### recurring_transactions
Stores recurring shared transactions.

### recurring_transaction_logs
Stores status of recurring item per month to prevent duplicate entries.

### saving_goals
Stores shared saving goals.

### notification_settings
Stores future webhook notification configuration.

---

## Security

Enable RLS on all Supabase tables.

Policies must ensure:
- Users only access households where they are members.
- Users cannot access other households.
- Shared transactions are scoped by household_id.
- Saving goals are scoped by household_id.
- Budgets are scoped by household_id.
- Recurring transactions are scoped by household_id.

Never rely only on frontend filtering for privacy.

---

## Transaction Types

Use these transaction types:

### contribution

Represents money added to shared funds.

Example:
“Fadil menambahkan Rp1.500.000 ke dana bersama.”

### expense

Represents shared spending.

Example:
“Belanja bulanan Rp350.000.”

### saving_contribution

Represents money added to a shared saving goal.

Example:
“Menambahkan Rp500.000 ke Dana Darurat Bersama.”

---

## Recurring Transaction Behavior

Recurring transactions should not automatically create transactions in MVP.

Instead:

1. Show recurring item due this month.
2. User clicks “Tandai sudah dibayar”.
3. App creates a shared transaction.
4. App creates a recurring_transaction_log entry.
5. App prevents duplicate creation for the same recurring item in the same month.

Also support:
- “Lewati bulan ini”

Frequency for MVP:
- monthly only

---

## Saving Goal Behavior

Users can create shared saving goals.

Each goal has:
- name
- target_amount
- current_amount
- target_date

Users can add saving contribution.

When adding contribution:
1. Increase current_amount.
2. Create shared_transactions row with type saving_contribution.
3. Link to saving goal if needed.

---

## Dashboard Requirements

Dashboard must show:

1. Financial mood/status
2. Monthly budget
3. Total shared expenses this month
4. Remaining budget
5. Safe daily spend until end of month
6. Shared saving progress
7. Daily expense chart
8. Expense by category chart
9. Recurring transactions due this month

Dashboard copy examples:

- “Aman. Pengeluaran bersama masih terkendali.”
- “Waspada. Pengeluaran bulan ini lebih cepat dari ritme aman.”
- “Kritis. Budget hampir habis sebelum akhir bulan.”
- “Melebihi batas. Pengeluaran bersama sudah melewati budget bulan ini.”
- “Agar tetap aman sampai akhir bulan, pengeluaran bersama sebaiknya tidak lebih dari RpX per hari.”

---

## Calculation Rules

Implement helpers for:

### formatCurrencyIDR

Use Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })

### Safe Daily Spend

Formula:

remainingBudget / remainingDaysInMonth

If remainingBudget <= 0:
return 0

If remainingDaysInMonth <= 0:
return remainingBudget

### Budget Usage Percentage

Formula:

totalExpense / monthlyBudget * 100

Handle monthlyBudget = 0.

### Month Progress Percentage

Formula:

currentDay / totalDaysInMonth * 100

### Financial Mood

Suggested:

If no budget:
status = "Belum Ada Budget"

If totalExpense > budget:
status = "Melebihi Batas"

Else:
usagePercentage = totalExpense / budget * 100
monthProgress = currentDay / totalDaysInMonth * 100

If usagePercentage <= monthProgress + 10:
status = "Aman"

If usagePercentage <= monthProgress + 25:
status = "Waspada"

Else:
status = "Kritis"

---

## Charts

Use Recharts.

Required charts:
- Daily expense line chart
- Expense by category pie/donut chart

Optional:
- Saving goal progress bar
- Budget usage progress bar

Charts must be readable on small mobile screens.

---

## Forms

Forms must be short and simple.

Transaction form fields:
- type
- amount
- category
- date
- paid_by
- description

Recurring form fields:
- name
- amount
- category
- due_day
- type

Saving goal form fields:
- name
- target_amount
- target_date

Budget form fields:
- month
- year
- amount

Use validation.

Show clear error messages.

---

## Suggested Folder Structure

src/
  app/
    login/
    register/
    app/
      dashboard/
      transactions/
      recurring/
      savings/
      settings/
  components/
    ui/
    layout/
    charts/
  features/
    auth/
    dashboard/
    transactions/
    recurring/
    savings/
    settings/
  lib/
    supabase/
    calculations/
    utils/
  types/

---

## Code Quality

Follow these rules:

- TypeScript strict mode
- Avoid any
- Keep business logic out of UI components
- Reuse components
- Use clear naming
- Handle loading state
- Handle empty state
- Handle error state
- Prefer small functions
- Prefer readable code over clever code
- Keep SQL migrations organized

---

## Environment Variables

Use environment variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

Do not expose service role key to client components.

---

## README Requirements

Create README.md with:

- Project overview
- Tech stack
- Environment variables
- Supabase setup
- SQL migration instructions
- Local development command
- Vercel deployment notes
- MVP feature list

---

## Do Not Implement Without Request

Do not implement these unless explicitly requested:

- Personal income tracker
- Personal expense tracker
- Partner income visibility
- Bank integration
- OCR receipt upload
- Investment module
- AI financial advisor
- Complex split bill
- Multi-currency
- Public SaaS onboarding
- Payment gateway
- PDF reports

---

## Definition of Done

The MVP is done when:

- User can register/login
- User can create/join household
- User can add shared expense
- User can add shared contribution
- User can set monthly budget
- User can view dashboard
- User can see financial mood
- User can see safe daily spending
- User can create recurring transaction
- User can mark recurring transaction as paid
- User can create saving goal
- User can add saving contribution
- RLS policies protect household data
- App is mobile-friendly
- App can be deployed to Vercel
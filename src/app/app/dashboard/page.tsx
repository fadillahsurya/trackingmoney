import Link from "next/link";
import { DailyExpenseChart } from "@/components/charts/daily-expense-chart";
import { ExpenseCategoryChart } from "@/components/charts/expense-category-chart";
import { moodLabels, moodMessages, moodStyles } from "@/features/budget/mood";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { transactionTypeLabels } from "@/features/transactions/types";
import {
  calculateBudgetUsagePercentage,
  calculateFinancialMood,
  calculateRemainingBudget,
  calculateSafeDailySpend,
  groupExpensesByCategory,
  groupExpensesByDate,
} from "@/lib/calculations/budget";
import { formatCurrencyIDR } from "@/lib/utils/currency";
import { formatDateID, getMonthRange } from "@/lib/utils/date";

export default async function DashboardPage() {
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) {
    return <HouseholdSetup userId={user.id} />;
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    full_name:
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : null,
    email: user.email ?? null,
  });

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const { startDate, endDate } = getMonthRange(year, month);

  const [
    { data: budget },
    { data: transactions },
    { data: categories },
    { data: latestTransactions },
  ] = await Promise.all([
    supabase
      .from("monthly_budgets")
      .select("*")
      .eq("household_id", household.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle(),
    supabase
      .from("shared_transactions")
      .select("*")
      .eq("household_id", household.id)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate),
    supabase
      .from("categories")
      .select("id, name")
      .eq("household_id", household.id),
    supabase
      .from("shared_transactions")
      .select("*, categories(name)")
      .eq("household_id", household.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const safeTransactions = transactions ?? [];
  const expenseTransactions = safeTransactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const totalExpense = expenseTransactions.reduce((sum, transaction) => {
    return sum + Number(transaction.amount);
  }, 0);
  const totalContribution = safeTransactions
    .filter((transaction) => transaction.type === "contribution")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const monthlyBudget = Number(budget?.amount ?? 0);
  const remainingBudget = calculateRemainingBudget(monthlyBudget, totalExpense);
  const safeDailySpend = calculateSafeDailySpend(
    monthlyBudget,
    totalExpense,
    today,
  );
  const mood = calculateFinancialMood(monthlyBudget, totalExpense, today);
  const budgetUsage = calculateBudgetUsagePercentage(
    monthlyBudget,
    totalExpense,
  );
  const dailyExpenseData = groupExpensesByDate(
    expenseTransactions.map((transaction) => ({
      amount: Number(transaction.amount),
      transaction_date: transaction.transaction_date,
    })),
  );
  const categoryExpenseData = groupExpensesByCategory(
    expenseTransactions.map((transaction) => ({
      amount: Number(transaction.amount),
      transaction_date: transaction.transaction_date,
      category_id: transaction.category_id,
    })),
    categories ?? [],
  );

  return (
    <div className="space-y-5">
      <section className={`rounded-lg border p-5 ${moodStyles[mood]}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold">Status Bulan Ini</h1>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">
            {moodLabels[mood]}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6">{moodMessages[mood]}</p>
        <div className="mt-4 h-2 rounded-full bg-white/70">
          <div
            className="h-2 rounded-full bg-current"
            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs">{budgetUsage.toFixed(0)}% budget terpakai</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Dana Bersama</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">
            {formatCurrencyIDR(totalContribution)}
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Pengeluaran Bersama
          </p>
          <p className="mt-2 text-lg font-semibold text-red-700">
            {formatCurrencyIDR(totalExpense)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Sisa Budget</p>
          <p className="mt-2 text-lg font-semibold">
            {formatCurrencyIDR(remainingBudget)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Aman Sampai Akhir Bulan
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatCurrencyIDR(safeDailySpend)}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/app/transactions/new"
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
        >
          Catat Pengeluaran
        </Link>
        <Link
          href="/app/transactions/new"
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-950 px-4 text-sm font-medium text-slate-950"
        >
          Tambah Kontribusi
        </Link>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Pengeluaran Harian</h2>
        <div className="mt-4">
          <DailyExpenseChart data={dailyExpenseData} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Pengeluaran per Kategori</h2>
        <div className="mt-4">
          <ExpenseCategoryChart data={categoryExpenseData} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Transaksi Terbaru</h2>
          <Link
            href="/app/transactions"
            className="text-sm font-medium text-slate-700 underline underline-offset-4"
          >
            Lihat semua
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {(latestTransactions ?? []).length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
              Belum ada transaksi.
            </p>
          ) : (
            (latestTransactions ?? []).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {transactionTypeLabels[transaction.type]}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.categories?.name ?? "Tanpa kategori"} -{" "}
                    {formatDateID(transaction.transaction_date)}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrencyIDR(Number(transaction.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

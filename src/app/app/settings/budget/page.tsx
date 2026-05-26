import { BudgetForm } from "@/features/budget/budget-form";
import { moodLabels, moodMessages, moodStyles } from "@/features/budget/mood";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import {
  calculateBudgetUsagePercentage,
  calculateFinancialMood,
  calculateRemainingBudget,
  calculateSafeDailySpend,
} from "@/lib/calculations/budget";
import { formatCurrencyIDR } from "@/lib/utils/currency";
import { getMonthOptions, getMonthRange } from "@/lib/utils/date";

type BudgetPageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const params = await searchParams;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) {
    return <HouseholdSetup userId={user.id} />;
  }

  const today = new Date();
  const selectedMonth = Number(params.month) || today.getMonth() + 1;
  const selectedYear = Number(params.year) || today.getFullYear();
  const { startDate, endDate } = getMonthRange(selectedYear, selectedMonth);

  const [{ data: budget }, { data: expenses }] = await Promise.all([
    supabase
      .from("monthly_budgets")
      .select("*")
      .eq("household_id", household.id)
      .eq("month", selectedMonth)
      .eq("year", selectedYear)
      .maybeSingle(),
    supabase
      .from("shared_transactions")
      .select("amount")
      .eq("household_id", household.id)
      .eq("type", "expense")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate),
  ]);

  const monthlyBudget = Number(budget?.amount ?? 0);
  const totalExpense = (expenses ?? []).reduce((sum, transaction) => {
    return sum + Number(transaction.amount);
  }, 0);
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
  const monthName = getMonthOptions().find(
    (item) => item.value === selectedMonth,
  )?.label;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">
          Budget Bulanan
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Budget Bulanan</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Atur batas pengeluaran bersama untuk {monthName} {selectedYear}.
        </p>
      </section>

      <BudgetForm
        householdId={household.id}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
        initialAmount={budget ? Number(budget.amount) : undefined}
      />

      {!budget ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-semibold text-amber-900">
            Budget bulan ini belum diatur.
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Isi nominal budget agar aplikasi bisa menghitung sisa budget dan
            batas aman harian.
          </p>
        </section>
      ) : null}

      <section className="grid gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Budget Bulanan</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrencyIDR(monthlyBudget)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Pengeluaran Bulan Ini
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-700">
            {formatCurrencyIDR(totalExpense)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sisa Budget</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrencyIDR(remainingBudget)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Aman Sampai Akhir Bulan
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrencyIDR(safeDailySpend)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {remainingBudget <= 0
              ? "Budget sudah habis untuk bulan ini."
              : `Agar tetap aman sampai akhir bulan, pengeluaran bersama sebaiknya tidak lebih dari ${formatCurrencyIDR(
                  safeDailySpend,
                )} per hari.`}
          </p>
        </div>

        <div className={`rounded-lg border p-5 ${moodStyles[mood]}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Status Bulan Ini</p>
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
        </div>
      </section>
    </div>
  );
}

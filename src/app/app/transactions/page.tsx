import Link from "next/link";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import {
  transactionTypeLabels,
  transactionTypeStyles,
  type TransactionType,
} from "@/features/transactions/types";
import { formatCurrencyIDR } from "@/lib/utils/currency";
import { formatDateID, getMonthOptions, getMonthRange } from "@/lib/utils/date";

type TransactionsPageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    type?: string;
  }>;
};

function isTransactionType(value: string): value is TransactionType {
  return ["contribution", "expense", "saving_contribution"].includes(value);
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) {
    return <HouseholdSetup userId={user.id} />;
  }

  const today = new Date();
  const selectedMonth = Number(params.month) || today.getMonth() + 1;
  const selectedYear = Number(params.year) || today.getFullYear();
  const selectedType =
    params.type && isTransactionType(params.type) ? params.type : "all";
  const { startDate, endDate } = getMonthRange(selectedYear, selectedMonth);

  let query = supabase
    .from("shared_transactions")
    .select("*, categories(name)")
    .eq("household_id", household.id)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (selectedType !== "all") {
    query = query.eq("type", selectedType);
  }

  const [{ data: transactions, error }, { data: members }, { data: profiles }] =
    await Promise.all([
      query,
      supabase
        .from("household_members")
        .select("user_id")
        .eq("household_id", household.id),
      supabase.from("profiles").select("id, full_name, email"),
    ]);

  const householdMemberIds = members?.map((member) => member.user_id) ?? [];
  const profileMap = new Map(
    (profiles ?? [])
      .filter((profile) => householdMemberIds.includes(profile.id))
      .map((profile) => [profile.id, profile]),
  );

  const safeTransactions = transactions ?? [];
  const totalExpense = safeTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalContribution = safeTransactions
    .filter((transaction) => transaction.type === "contribution")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const monthOptions = getMonthOptions();
  const yearOptions = Array.from({ length: 5 }, (_, index) => {
    return today.getFullYear() - 2 + index;
  });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">
          Transaksi Bersama
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Transaksi Bersama</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Kelola kontribusi dan pengeluaran bersama household.
            </p>
          </div>
        </div>
        <Link
          href="/app/transactions/new"
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
        >
          Catat Pengeluaran
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Total pengeluaran bulan ini
          </p>
          <p className="mt-2 text-lg font-semibold text-red-700">
            {formatCurrencyIDR(totalExpense)}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Total kontribusi bulan ini
          </p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">
            {formatCurrencyIDR(totalContribution)}
          </p>
        </div>
      </section>

      <form className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Bulan</span>
          <select
            name="month"
            defaultValue={selectedMonth}
            className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Tahun</span>
          <select
            name="year"
            defaultValue={selectedYear}
            className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Jenis</span>
          <select
            name="type"
            defaultValue={selectedType}
            className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
          >
            <option value="all">Semua</option>
            <option value="expense">Expense</option>
            <option value="contribution">Contribution</option>
            <option value="saving_contribution">Tabungan</option>
          </select>
        </label>
        <button
          type="submit"
          className="col-span-3 h-10 rounded-md border border-slate-950 px-4 text-sm font-medium text-slate-950"
        >
          Terapkan Filter
        </button>
      </form>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Gagal memuat transaksi: {error.message}
        </p>
      ) : null}

      <section className="space-y-3">
        {safeTransactions.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
            <h2 className="text-base font-semibold">Belum ada transaksi</h2>
            <p className="mt-2 text-sm text-slate-600">
              Catat pengeluaran atau kontribusi bersama pertama bulan ini.
            </p>
          </div>
        ) : (
          safeTransactions.map((transaction) => {
            const profile = profileMap.get(transaction.paid_by);
            const paidBy =
              profile?.full_name || profile?.email || "Anggota household";

            return (
              <article
                key={transaction.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                        transactionTypeStyles[transaction.type]
                      }`}
                    >
                      {transactionTypeLabels[transaction.type]}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold">
                      {formatCurrencyIDR(Number(transaction.amount))}
                    </h2>
                  </div>
                  <Link
                    href={`/app/transactions/${transaction.id}/edit`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Edit
                  </Link>
                </div>

                <dl className="mt-4 grid gap-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-3">
                    <dt>Kategori</dt>
                    <dd className="text-right text-slate-900">
                      {transaction.categories?.name ?? "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Tanggal</dt>
                    <dd className="text-right text-slate-900">
                      {formatDateID(transaction.transaction_date)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Dibayar oleh</dt>
                    <dd className="text-right text-slate-900">{paidBy}</dd>
                  </div>
                </dl>

                {transaction.description ? (
                  <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {transaction.description}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { RecurringActions } from "@/features/recurring/recurring-actions";
import { transactionTypeLabels, transactionTypeStyles } from "@/features/transactions/types";
import { formatCurrencyIDR } from "@/lib/utils/currency";

export default async function RecurringPage() {
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const [{ data: recurring }, { data: logs }] = await Promise.all([
    supabase
      .from("recurring_transactions")
      .select("*, categories(name)")
      .eq("household_id", household.id)
      .order("due_day", { ascending: true }),
    supabase
      .from("recurring_transaction_logs")
      .select("*")
      .eq("household_id", household.id)
      .eq("month", month)
      .eq("year", year),
  ]);

  const logMap = new Map((logs ?? []).map((log) => [log.recurring_transaction_id, log]));
  const dueThisMonth = (recurring ?? []).filter((item) => item.is_active);

  function renderCard(item: NonNullable<typeof recurring>[number]) {
    const log = logMap.get(item.id);
    const status = log?.status ?? "unpaid";
    const isDone = status === "paid" || status === "skipped";

    return (
      <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${transactionTypeStyles[item.type]}`}>
              {transactionTypeLabels[item.type]}
            </p>
            <h3 className="mt-3 text-lg font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{formatCurrencyIDR(Number(item.amount))} - Setiap Bulan tanggal {item.due_day}</p>
            <p className="mt-1 text-sm text-slate-600">Kategori: {item.categories?.name ?? "-"}</p>
          </div>
          <Link href={`/app/recurring/${item.id}/edit`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">
            Edit
          </Link>
        </div>
        <p className="mt-3 text-sm font-medium">
          Status: {status === "paid" ? "Sudah Dibayar" : status === "skipped" ? "Dilewati" : "Belum Dibayar"}
        </p>
        <RecurringActions recurringId={item.id} month={month} year={year} disabled={isDone} />
      </article>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Transaksi Rutin</p>
        <h1 className="mt-2 text-2xl font-semibold">Transaksi Rutin</h1>
        <Link href="/app/recurring/new" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white">
          Tambah Transaksi Rutin
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Jatuh Tempo Bulan Ini</h2>
        {dueThisMonth.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">Belum ada transaksi rutin aktif.</p>
        ) : dueThisMonth.map(renderCard)}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Semua Transaksi Rutin</h2>
        {(recurring ?? []).length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">Belum ada transaksi rutin.</p>
        ) : (recurring ?? []).map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{formatCurrencyIDR(Number(item.amount))} - tanggal {item.due_day}</p>
                <p className="mt-1 text-sm font-medium">{item.is_active ? "Aktif" : "Nonaktif"}</p>
              </div>
              <Link href={`/app/recurring/${item.id}/edit`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Edit</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

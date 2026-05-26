import Link from "next/link";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { formatCurrencyIDR } from "@/lib/utils/currency";
import { formatDateID } from "@/lib/utils/date";

export default async function SavingsPage() {
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const { data: goals } = await supabase
    .from("saving_goals")
    .select("*")
    .eq("household_id", household.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Tabungan Bersama</p>
        <h1 className="mt-2 text-2xl font-semibold">Target Tabungan</h1>
        <Link href="/app/savings/new" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white">
          Tambah Target
        </Link>
      </section>

      <section className="space-y-3">
        {(goals ?? []).length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">Belum ada target tabungan.</p>
        ) : (goals ?? []).map((goal) => {
          const current = Number(goal.current_amount);
          const target = Number(goal.target_amount);
          const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
          return (
            <article key={goal.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{goal.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {goal.target_date ? `Target: ${formatDateID(goal.target_date)}` : "Tanggal target belum diatur"}
                  </p>
                </div>
                <Link href={`/app/savings/${goal.id}`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Detail</Link>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${percentage}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Terkumpul {formatCurrencyIDR(current)} dari {formatCurrencyIDR(target)}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

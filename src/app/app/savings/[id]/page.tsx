import Link from "next/link";
import { notFound } from "next/navigation";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { DeleteSavingGoalButton } from "@/features/savings/delete-saving-goal-button";
import { formatCurrencyIDR } from "@/lib/utils/currency";
import { formatDateID, getMonthRange } from "@/lib/utils/date";

type SavingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SavingDetailPage({ params }: SavingDetailPageProps) {
  const { id } = await params;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const { data: goal } = await supabase
    .from("saving_goals")
    .select("*")
    .eq("id", id)
    .eq("household_id", household.id)
    .single();

  if (!goal) notFound();

  const today = new Date();
  const { startDate, endDate } = getMonthRange(today.getFullYear(), today.getMonth() + 1);
  const { data: contributions } = await supabase
    .from("shared_transactions")
    .select("amount, transaction_date")
    .eq("household_id", household.id)
    .eq("saving_goal_id", goal.id)
    .eq("type", "saving_contribution")
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = Math.max(target - current, 0);
  const monthlyContribution = (contributions ?? []).reduce((sum, item) => sum + Number(item.amount), 0);
  const estimateText = monthlyContribution > 0
    ? `${Math.ceil(remaining / monthlyContribution)} bulan lagi dengan ritme bulan ini.`
    : "Terlalu sedikit data untuk estimasi.";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Tabungan Bersama</p>
        <h1 className="mt-2 text-2xl font-semibold">{goal.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{goal.target_date ? `Tanggal Target: ${formatDateID(goal.target_date)}` : "Tanggal target belum diatur"}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href={`/app/savings/${goal.id}/contribute`} className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white">Tambah Kontribusi</Link>
          <Link href={`/app/savings/${goal.id}/edit`} className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium">Edit</Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Progress</h2>
        <div className="mt-4 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${percentage}%` }} />
        </div>
        <div className="mt-4 grid gap-3 text-sm">
          <p>Terkumpul: <strong>{formatCurrencyIDR(current)}</strong></p>
          <p>Target Nominal: <strong>{formatCurrencyIDR(target)}</strong></p>
          <p>Sisa Target: <strong>{formatCurrencyIDR(remaining)}</strong></p>
          <p>Estimasi Tercapai: <strong>{estimateText}</strong></p>
        </div>
      </section>

      <DeleteSavingGoalButton goalId={goal.id} householdId={household.id} />
    </div>
  );
}

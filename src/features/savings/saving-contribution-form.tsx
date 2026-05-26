"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toDateInputValue } from "@/lib/utils/date";

type Member = {
  user_id: string;
  full_name: string | null;
  email: string | null;
};

type SavingContributionFormProps = {
  savingGoalId: string;
  savingGoalName: string;
  userId: string;
  members: Member[];
};

export function SavingContributionForm({
  savingGoalId,
  savingGoalName,
  userId,
  members,
}: SavingContributionFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(userId);
  const [date, setDate] = useState(toDateInputValue());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setIsSubmitting(false);
      setErrorMessage("Nominal kontribusi wajib lebih dari 0.");
      return;
    }

    const { error } = await supabase.rpc("add_saving_contribution", {
      target_saving_goal_id: savingGoalId,
      contribution_amount: parsedAmount,
      paid_by_user_id: paidBy,
      contribution_date: date,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(`/app/savings/${savingGoalId}`);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Kontribusi Saya</p>
        <h1 className="mt-2 text-2xl font-semibold">Tambah Kontribusi</h1>
        <p className="mt-2 text-sm text-slate-600">{savingGoalName}</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nominal</span>
          <input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Dibayar Oleh</span>
          <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm">
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>{member.full_name || member.email || "Anggota household"}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tanggal</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>
        {errorMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
        <div className="grid gap-3">
          <button disabled={isSubmitting} className="h-11 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-400">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <Link href={`/app/savings/${savingGoalId}`} className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium">Batal</Link>
        </div>
      </form>
    </div>
  );
}

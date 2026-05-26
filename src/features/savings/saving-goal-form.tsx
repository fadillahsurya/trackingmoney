"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type SavingGoalRow = Database["public"]["Tables"]["saving_goals"]["Row"];

type SavingGoalFormProps = {
  householdId: string;
  userId: string;
  initialGoal?: SavingGoalRow;
};

export function SavingGoalForm({ householdId, userId, initialGoal }: SavingGoalFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialGoal?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(initialGoal ? String(initialGoal.target_amount) : "");
  const [targetDate, setTargetDate] = useState(initialGoal?.target_date ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const parsedTarget = Number(targetAmount);

    if (!name.trim()) {
      setIsSubmitting(false);
      setErrorMessage("Nama target wajib diisi.");
      return;
    }

    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setIsSubmitting(false);
      setErrorMessage("Target nominal wajib lebih dari 0.");
      return;
    }

    const sharedPayload = {
      name: name.trim(),
      target_amount: parsedTarget,
      target_date: targetDate || null,
    };
    const insertPayload = {
      household_id: householdId,
      created_by: userId,
      current_amount: initialGoal?.current_amount ?? 0,
      ...sharedPayload,
    };

    const { data, error } = initialGoal
      ? await supabase
          .from("saving_goals")
          .update(sharedPayload)
          .eq("id", initialGoal.id)
          .eq("household_id", householdId)
          .select("id")
          .single()
      : await supabase.from("saving_goals").insert(insertPayload).select("id").single();

    setIsSubmitting(false);

    if (error || !data) {
      setErrorMessage(error?.message ?? "Target belum berhasil disimpan.");
      return;
    }

    router.push(`/app/savings/${data.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Tabungan Bersama</p>
        <h1 className="mt-2 text-2xl font-semibold">{initialGoal ? "Edit Target" : "Tambah Target"}</h1>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nama Target</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Target Nominal</span>
          <input type="number" min="1" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tanggal Target</span>
          <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" />
        </label>
        {errorMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
        <div className="grid gap-3">
          <button disabled={isSubmitting} className="h-11 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-400">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <Link href="/app/savings" className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium">Batal</Link>
        </div>
      </form>
    </div>
  );
}

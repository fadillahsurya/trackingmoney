"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { TransactionType } from "@/features/transactions/types";

type Category = Pick<Database["public"]["Tables"]["categories"]["Row"], "id" | "name">;
type RecurringRow = Database["public"]["Tables"]["recurring_transactions"]["Row"];

type RecurringFormProps = {
  householdId: string;
  userId: string;
  categories: Category[];
  initialRecurring?: RecurringRow;
};

export function RecurringForm({
  householdId,
  userId,
  categories,
  initialRecurring,
}: RecurringFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialRecurring?.name ?? "");
  const [amount, setAmount] = useState(initialRecurring ? String(initialRecurring.amount) : "");
  const [type, setType] = useState<TransactionType>(initialRecurring?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initialRecurring?.category_id ?? "");
  const [dueDay, setDueDay] = useState(initialRecurring ? String(initialRecurring.due_day) : "1");
  const [isActive, setIsActive] = useState(initialRecurring?.is_active ?? true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const parsedAmount = Number(amount);
    const parsedDueDay = Number(dueDay);

    if (!name.trim()) {
      setIsSubmitting(false);
      setErrorMessage("Nama wajib diisi.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setIsSubmitting(false);
      setErrorMessage("Nominal wajib lebih dari 0.");
      return;
    }

    if (!Number.isInteger(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      setIsSubmitting(false);
      setErrorMessage("Tanggal jatuh tempo wajib 1-31.");
      return;
    }

    if (type === "expense" && !categoryId) {
      setIsSubmitting(false);
      setErrorMessage("Kategori wajib untuk expense.");
      return;
    }

    const sharedPayload = {
      name: name.trim(),
      amount: parsedAmount,
      category_id: categoryId || null,
      type,
      frequency: "monthly" as const,
      due_day: parsedDueDay,
      is_active: isActive,
    };
    const insertPayload = {
      household_id: householdId,
      created_by: userId,
      ...sharedPayload,
    };

    const { error } = initialRecurring
      ? await supabase
          .from("recurring_transactions")
          .update(sharedPayload)
          .eq("id", initialRecurring.id)
          .eq("household_id", householdId)
      : await supabase.from("recurring_transactions").insert(insertPayload);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/app/recurring");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Transaksi Rutin</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {initialRecurring ? "Edit Transaksi Rutin" : "Tambah Transaksi Rutin"}
        </h1>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nama</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nominal</span>
          <input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Jenis</span>
          <select value={type} onChange={(event) => {
            const nextType = event.target.value as TransactionType;
            setType(nextType);
            if (nextType !== "expense") setCategoryId("");
          }} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm">
            <option value="expense">Expense</option>
            <option value="contribution">Contribution</option>
            <option value="saving_contribution">Saving Contribution</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Kategori</span>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={type !== "expense"} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm disabled:bg-slate-100">
            <option value="">{type === "expense" ? "Pilih kategori" : "Tidak wajib"}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tanggal Jatuh Tempo</span>
          <input type="number" min="1" max="31" value={dueDay} onChange={(event) => setDueDay(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm" required />
        </label>

        <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3">
          <span className="text-sm font-medium text-slate-700">{isActive ? "Aktif" : "Nonaktif"}</span>
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        </label>

        {errorMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="grid gap-3">
          <button disabled={isSubmitting} className="h-11 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-400">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <Link href="/app/recurring" className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium">Batal</Link>
        </div>
      </form>
    </div>
  );
}

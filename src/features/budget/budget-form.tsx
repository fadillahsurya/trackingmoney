"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getMonthOptions } from "@/lib/utils/date";

type BudgetFormProps = {
  householdId: string;
  initialMonth: number;
  initialYear: number;
  initialAmount?: number;
};

export function BudgetForm({
  householdId,
  initialMonth,
  initialYear,
  initialAmount,
}: BudgetFormProps) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : "");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const monthOptions = getMonthOptions();
  const yearOptions = Array.from({ length: 5 }, (_, index) => {
    return new Date().getFullYear() - 2 + index;
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setIsSubmitting(false);
      setErrorMessage("Nominal budget wajib diisi dengan angka valid.");
      return;
    }

    const { error } = await supabase.from("monthly_budgets").upsert(
      {
        household_id: householdId,
        month,
        year,
        amount: parsedAmount,
      },
      {
        onConflict: "household_id,month,year",
      },
    );

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Budget berhasil disimpan.");
    router.push(`/app/settings/budget?month=${month}&year=${year}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold">Atur Budget Bulanan</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Bulan</span>
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {monthOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tahun</span>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {yearOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Nominal Budget
        </span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
          placeholder="Contoh: 3000000"
          required
        />
      </label>

      {errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Budget"}
      </button>
    </form>
  );
}

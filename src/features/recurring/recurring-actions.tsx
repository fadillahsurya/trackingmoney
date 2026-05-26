"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type RecurringActionsProps = {
  recurringId: string;
  month: number;
  year: number;
  disabled: boolean;
};

export function RecurringActions({ recurringId, month, year, disabled }: RecurringActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function markPaid() {
    setIsLoading(true);
    setMessage(null);
    const { error } = await supabase.rpc("mark_recurring_paid", {
      target_recurring_transaction_id: recurringId,
      target_month: month,
      target_year: year,
    });
    setIsLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.refresh();
  }

  async function skipMonth() {
    setIsLoading(true);
    setMessage(null);
    const { error } = await supabase.rpc("skip_recurring_for_month", {
      target_recurring_transaction_id: recurringId,
      target_month: month,
      target_year: year,
    });
    setIsLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 grid gap-2">
      <button type="button" onClick={markPaid} disabled={disabled || isLoading} className="h-10 rounded-md bg-slate-950 px-3 text-sm font-medium text-white disabled:bg-slate-300">
        Tandai Sudah Dibayar
      </button>
      <button type="button" onClick={skipMonth} disabled={disabled || isLoading} className="h-10 rounded-md border border-slate-300 px-3 text-sm font-medium disabled:text-slate-400">
        Lewati Bulan Ini
      </button>
      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}
    </div>
  );
}

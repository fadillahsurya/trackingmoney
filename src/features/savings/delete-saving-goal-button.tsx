"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type DeleteSavingGoalButtonProps = {
  goalId: string;
  householdId: string;
};

export function DeleteSavingGoalButton({
  goalId,
  householdId,
}: DeleteSavingGoalButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Hapus target tabungan ini? Kontribusi yang sudah tercatat tetap ada di daftar transaksi.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("saving_goals")
      .delete()
      .eq("id", goalId)
      .eq("household_id", householdId);

    setIsDeleting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/app/savings");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-11 w-full rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-700 disabled:text-red-300"
      >
        {isDeleting ? "Menghapus..." : "Hapus"}
      </button>
      {errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toDateInputValue } from "@/lib/utils/date";
import type { Database } from "@/types/database";
import type { TransactionType } from "./types";

type Category = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name"
>;

type Member = {
  user_id: string;
  full_name: string | null;
  email: string | null;
};

type TransactionRow =
  Database["public"]["Tables"]["shared_transactions"]["Row"];

type TransactionFormProps = {
  householdId: string;
  userId: string;
  categories: Category[];
  members: Member[];
  initialTransaction?: TransactionRow;
};

export function TransactionForm({
  householdId,
  userId,
  categories,
  members,
  initialTransaction,
}: TransactionFormProps) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type ?? "expense",
  );
  const [amount, setAmount] = useState(
    initialTransaction ? String(initialTransaction.amount) : "",
  );
  const [categoryId, setCategoryId] = useState(
    initialTransaction?.category_id ?? "",
  );
  const [transactionDate, setTransactionDate] = useState(
    initialTransaction?.transaction_date ?? toDateInputValue(),
  );
  const [paidBy, setPaidBy] = useState(initialTransaction?.paid_by ?? userId);
  const [description, setDescription] = useState(
    initialTransaction?.description ?? "",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = Boolean(initialTransaction);
  const pageTitle = isEditing ? "Edit Transaksi" : "Transaksi Bersama";

  const memberOptions = useMemo(() => {
    return members.map((member) => ({
      value: member.user_id,
      label: member.full_name || member.email || "Anggota household",
    }));
  }, [members]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setIsSubmitting(false);
      setErrorMessage("Nominal wajib lebih dari 0.");
      return;
    }

    if (!transactionDate) {
      setIsSubmitting(false);
      setErrorMessage("Tanggal wajib diisi.");
      return;
    }

    if (type === "expense" && !categoryId) {
      setIsSubmitting(false);
      setErrorMessage("Kategori wajib dipilih untuk pengeluaran.");
      return;
    }

    const sharedPayload = {
      paid_by: paidBy,
      type,
      amount: parsedAmount,
      category_id: categoryId || null,
      saving_goal_id: initialTransaction?.saving_goal_id ?? null,
      description: description.trim() || null,
      transaction_date: transactionDate,
    };
    const insertPayload = {
      household_id: householdId,
      created_by: initialTransaction?.created_by ?? userId,
      ...sharedPayload,
    };

    const { error } = initialTransaction
      ? await supabase
          .from("shared_transactions")
          .update(sharedPayload)
          .eq("id", initialTransaction.id)
          .eq("household_id", householdId)
      : await supabase.from("shared_transactions").insert(insertPayload);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Transaksi berhasil disimpan.");
    router.push("/app/transactions");
    router.refresh();
  }

  async function handleDelete() {
    if (!initialTransaction) {
      return;
    }

    const confirmed = window.confirm("Hapus transaksi ini?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("shared_transactions")
      .delete()
      .eq("id", initialTransaction.id)
      .eq("household_id", householdId);

    setIsDeleting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/app/transactions");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">
          Transaksi Bersama
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{pageTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Catat hanya transaksi bersama household. Tidak ada pencatatan income
          pribadi di sini.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Jenis Transaksi
          </span>
          <select
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as TransactionType;
              setType(nextType);

              if (nextType !== "expense") {
                setCategoryId("");
              }
            }}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
          >
            <option value="expense">Catat Pengeluaran</option>
            <option value="contribution">Tambah Kontribusi</option>
            <option value="saving_contribution">Kontribusi Tabungan</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nominal</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
            placeholder="Contoh: 50000"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Kategori</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={type !== "expense"}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {type === "expense" ? "Pilih kategori" : "Tidak wajib"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tanggal</span>
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Dibayar Oleh
          </span>
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
          >
            {memberOptions.map((member) => (
              <option key={member.value} value={member.value}>
                {member.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Catatan</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
            placeholder="Opsional"
          />
        </label>

        {errorMessage ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="grid gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <Link
            href="/app/transactions"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700"
          >
            Batal
          </Link>
        </div>
      </form>

      {initialTransaction ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-11 w-full rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:text-red-300"
        >
          {isDeleting ? "Menghapus..." : "Hapus"}
        </button>
      ) : null}
    </div>
  );
}

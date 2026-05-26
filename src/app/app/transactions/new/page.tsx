import Link from "next/link";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { TransactionForm } from "@/features/transactions/transaction-form";
import {
  getExpenseCategories,
  getHouseholdMembers,
} from "@/features/transactions/queries";

export default async function NewTransactionPage() {
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) {
    return <HouseholdSetup userId={user.id} />;
  }

  const [categories, members] = await Promise.all([
    getExpenseCategories(supabase, household.id),
    getHouseholdMembers(supabase, household.id),
  ]);

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Kategori belum tersedia</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kategori default belum ada. Buka halaman Household atau jalankan ulang
          seed kategori dari SQL/RPC.
        </p>
        <Link
          href="/app/transactions"
          className="mt-4 inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-medium"
        >
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <TransactionForm
      householdId={household.id}
      userId={user.id}
      categories={categories}
      members={members}
    />
  );
}

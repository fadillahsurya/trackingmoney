import { notFound } from "next/navigation";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { TransactionForm } from "@/features/transactions/transaction-form";
import {
  getExpenseCategories,
  getHouseholdMembers,
} from "@/features/transactions/queries";

type EditTransactionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) {
    return <HouseholdSetup userId={user.id} />;
  }

  const [{ data: transaction }, categories, members] = await Promise.all([
    supabase
      .from("shared_transactions")
      .select("*")
      .eq("id", id)
      .eq("household_id", household.id)
      .single(),
    getExpenseCategories(supabase, household.id),
    getHouseholdMembers(supabase, household.id),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <TransactionForm
      householdId={household.id}
      userId={user.id}
      categories={categories}
      members={members}
      initialTransaction={transaction}
    />
  );
}

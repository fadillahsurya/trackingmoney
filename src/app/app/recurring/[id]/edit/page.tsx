import { notFound } from "next/navigation";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { RecurringForm } from "@/features/recurring/recurring-form";
import { getExpenseCategories } from "@/features/transactions/queries";

type EditRecurringPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecurringPage({ params }: EditRecurringPageProps) {
  const { id } = await params;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const [{ data: recurring }, categories] = await Promise.all([
    supabase
      .from("recurring_transactions")
      .select("*")
      .eq("id", id)
      .eq("household_id", household.id)
      .single(),
    getExpenseCategories(supabase, household.id),
  ]);

  if (!recurring) notFound();

  return (
    <RecurringForm
      householdId={household.id}
      userId={user.id}
      categories={categories}
      initialRecurring={recurring}
    />
  );
}

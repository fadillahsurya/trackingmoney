import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { RecurringForm } from "@/features/recurring/recurring-form";
import { getExpenseCategories } from "@/features/transactions/queries";

export default async function NewRecurringPage() {
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const categories = await getExpenseCategories(supabase, household.id);

  return <RecurringForm householdId={household.id} userId={user.id} categories={categories} />;
}

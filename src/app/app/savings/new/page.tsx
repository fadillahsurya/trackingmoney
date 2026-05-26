import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { SavingGoalForm } from "@/features/savings/saving-goal-form";

export default async function NewSavingPage() {
  const { user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  return <SavingGoalForm householdId={household.id} userId={user.id} />;
}

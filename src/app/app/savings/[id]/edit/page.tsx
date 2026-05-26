import { notFound } from "next/navigation";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { SavingGoalForm } from "@/features/savings/saving-goal-form";

type EditSavingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSavingPage({ params }: EditSavingPageProps) {
  const { id } = await params;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const { data: goal } = await supabase
    .from("saving_goals")
    .select("*")
    .eq("id", id)
    .eq("household_id", household.id)
    .single();

  if (!goal) notFound();

  return <SavingGoalForm householdId={household.id} userId={user.id} initialGoal={goal} />;
}

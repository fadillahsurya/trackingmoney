import { notFound } from "next/navigation";
import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";
import { SavingContributionForm } from "@/features/savings/saving-contribution-form";
import { getHouseholdMembers } from "@/features/transactions/queries";

type ContributeSavingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContributeSavingPage({ params }: ContributeSavingPageProps) {
  const { id } = await params;
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const [{ data: goal }, members] = await Promise.all([
    supabase
      .from("saving_goals")
      .select("id, name")
      .eq("id", id)
      .eq("household_id", household.id)
      .single(),
    getHouseholdMembers(supabase, household.id),
  ]);

  if (!goal) notFound();

  return <SavingContributionForm savingGoalId={goal.id} savingGoalName={goal.name} userId={user.id} members={members} />;
}

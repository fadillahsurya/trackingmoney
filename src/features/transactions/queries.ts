import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function getHouseholdMembers(
  supabase: SupabaseClient<Database>,
  householdId: string,
) {
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);

  const userIds = members?.map((member) => member.user_id) ?? [];

  if (userIds.length === 0) {
    return [];
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  return userIds.map((userId) => {
    const profile = profiles?.find((item) => item.id === userId);

    return {
      user_id: userId,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
    };
  });
}

export async function getExpenseCategories(
  supabase: SupabaseClient<Database>,
  householdId: string,
) {
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .eq("household_id", householdId)
    .eq("type", "expense")
    .order("name", { ascending: true });

  return data ?? [];
}

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActiveHousehold = {
  id: string;
  name: string;
  invite_code: string;
  role: "owner" | "member";
};

export async function getCurrentUserAndHousehold() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { supabase, user, household: null };
  }

  const { data: household } = await supabase
    .from("households")
    .select("id, name, invite_code")
    .eq("id", membership.household_id)
    .single();

  if (!household) {
    return { supabase, user, household: null };
  }

  return {
    supabase,
    user,
    household: {
      ...household,
      role: membership.role,
    } satisfies ActiveHousehold,
  };
}

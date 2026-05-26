import { HouseholdSetup } from "@/features/household/household-setup";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HouseholdPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return <HouseholdSetup userId={user.id} />;
  }

  const { data: household } = await supabase
    .from("households")
    .select("name, invite_code")
    .eq("id", membership.household_id)
    .single();

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Household</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {household?.name ?? "Household"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kamu sudah tergabung sebagai {membership.role}.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Invite code</h2>
        <p className="mt-2 text-sm text-slate-600">
          Household maksimal 2 anggota untuk menjaga aplikasi tetap private.
        </p>
        <p className="mt-4 rounded-md bg-slate-100 px-4 py-3 text-center text-2xl font-semibold tracking-widest text-slate-950">
          {household?.invite_code ?? "-"}
        </p>
      </section>
    </div>
  );
}

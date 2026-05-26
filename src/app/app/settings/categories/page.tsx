import { HouseholdSetup } from "@/features/household/household-setup";
import { getCurrentUserAndHousehold } from "@/features/household/queries";

export default async function CategoriesPage() {
  const { supabase, user, household } = await getCurrentUserAndHousehold();

  if (!household) return <HouseholdSetup userId={user.id} />;

  const { data: categories } = await supabase
    .from("categories")
    .select("name, type")
    .eq("household_id", household.id)
    .order("name", { ascending: true });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Kategori</p>
        <h1 className="mt-2 text-2xl font-semibold">Kategori</h1>
        <p className="mt-2 text-sm text-slate-600">Pengelolaan kategori custom akan dirapikan di tahap berikutnya.</p>
      </section>
      <section className="space-y-3">
        {(categories ?? []).map((category) => (
          <div key={category.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-medium">{category.name}</p>
            <p className="mt-1 text-sm text-slate-500">{category.type}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

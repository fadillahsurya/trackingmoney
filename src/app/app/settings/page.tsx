import Link from "next/link";

const settingsLinks = [
  { href: "/app/settings/budget", label: "Budget Bulanan" },
  { href: "/app/settings/categories", label: "Kategori" },
  { href: "/app/settings/household", label: "Household" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Setting</p>
        <h1 className="mt-2 text-2xl font-semibold">Pengaturan</h1>
      </section>
      <section className="space-y-3">
        {settingsLinks.map((item) => (
          <Link key={item.href} href={item.href} className="flex h-14 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm">
            {item.label}
            <span>›</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

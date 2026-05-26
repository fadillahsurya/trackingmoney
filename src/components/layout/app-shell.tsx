import Link from "next/link";
import { LogoutButton } from "@/features/auth/logout-button";

type AppShellProps = {
  children: React.ReactNode;
  email?: string;
};

const navigationItems = [
  { href: "/app/dashboard", label: "Home" },
  { href: "/app/transactions", label: "Catat" },
  { href: "/app/recurring", label: "Rutin" },
  { href: "/app/savings", label: "Tabungan" },
  { href: "/app/settings", label: "Setting" },
];

export function AppShell({ children, email }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Tracking Money</p>
            <p className="truncate text-xs text-slate-500">
              {email ?? "Keuangan bersama"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-24 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto grid h-16 max-w-md grid-cols-5">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center text-sm font-medium text-slate-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

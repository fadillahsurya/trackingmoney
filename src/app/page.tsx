import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Tahap 1</p>
          <h1 className="mt-2 text-2xl font-semibold">Tracking Money</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Aplikasi private untuk mencatat keuangan bersama pasangan. Saat ini
            auth dan household flow sudah disiapkan sebagai fondasi aplikasi.
          </p>
        </section>

        <div className="grid gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-950 px-4 text-sm font-medium text-slate-950"
          >
            Daftar
          </Link>
          <Link
            href="/supabase-test"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700"
          >
            Cek Koneksi Supabase
          </Link>
        </div>
      </div>
    </main>
  );
}

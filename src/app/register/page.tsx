import { AuthForm } from "@/features/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Tracking Money</p>
        <h1 className="mt-2 text-2xl font-semibold">Daftar</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Buat akun untuk memulai pencatatan keuangan bersama pasangan.
        </p>

        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
      </section>
    </main>
  );
}

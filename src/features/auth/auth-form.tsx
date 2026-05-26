"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setIsSubmitting(false);

      if (error) {
        setErrorMessage("Email atau password belum cocok.");
        return;
      }

      router.replace("/app");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    if (data.user && data.session) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName || null,
        email: data.user.email ?? email,
      });

      setIsSubmitting(false);
      router.replace("/app");
      router.refresh();
      return;
    }

    setIsSubmitting(false);
    setMessage(
      "Akun berhasil dibuat. Cek email untuk konfirmasi sebelum login.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nama</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
            placeholder="Nama panggilan"
            autoComplete="name"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
          placeholder="nama@email.com"
          autoComplete="email"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
          placeholder="Minimal 6 karakter"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={6}
          required
        />
      </label>

      {errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Memproses..." : isLogin ? "Login" : "Daftar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-medium text-slate-950 underline underline-offset-4"
        >
          {isLogin ? "Daftar" : "Login"}
        </Link>
      </p>
    </form>
  );
}

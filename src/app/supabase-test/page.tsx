"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ConnectionStatus = "idle" | "loading" | "success" | "error";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [message, setMessage] = useState("Mengecek koneksi Supabase...");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  async function checkConnection() {
    setStatus("loading");
    setMessage("Mengecek koneksi Supabase...");

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setStatus("error");
      setMessage(`Gagal terhubung ke Supabase: ${error.message}`);
      setSessionEmail(null);
      return;
    }

    setStatus("success");
    setMessage("Supabase berhasil terkoneksi.");
    setSessionEmail(data.session?.user.email ?? null);
  }

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setStatus("error");
        setMessage(`Gagal terhubung ke Supabase: ${error.message}`);
        setSessionEmail(null);
        return;
      }

      setStatus("success");
      setMessage("Supabase berhasil terkoneksi.");
      setSessionEmail(data.session?.user.email ?? null);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const badgeClassName =
    status === "success"
      ? "bg-emerald-100 text-emerald-800"
      : status === "error"
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-700";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Supabase</p>
            <h1 className="mt-1 text-2xl font-semibold">Tes Koneksi</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClassName}`}>
            {status === "loading" ? "Mengecek" : status === "success" ? "Terhubung" : status === "error" ? "Gagal" : "Siap"}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="font-medium text-slate-700">Status koneksi</p>
            <p className="mt-1 text-slate-600">{message}</p>
          </div>

          <div>
            <p className="font-medium text-slate-700">Sesi</p>
            <p className="mt-1 text-slate-600">
              {sessionEmail
                ? `Login sebagai ${sessionEmail}`
                : "Belum ada user yang login."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={checkConnection}
          disabled={status === "loading"}
          className="mt-6 h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Cek Ulang
        </button>
      </section>
    </main>
  );
}

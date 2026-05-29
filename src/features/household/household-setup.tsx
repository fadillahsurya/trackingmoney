"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type HouseholdSetupProps = {
  userId: string;
};

function createInviteCode() {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
  return randomValue.toString(36).toUpperCase().slice(0, 6).padEnd(6, "X");
}

export function HouseholdSetup({ userId }: HouseholdSetupProps) {
  const router = useRouter();
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  async function handleCreateHousehold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setMessage(null);
    setErrorMessage(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsCreating(false);
      setErrorMessage(
        "Sesi browser tidak ditemukan. Silakan coba logout lalu login kembali untuk menyegarkan sesi."
      );
      return;
    }

    if (session.user.id !== userId) {
      setIsCreating(false);
      setErrorMessage(
        `User ID tidak cocok! Client: ${session.user.id}, Server: ${userId}`
      );
      return;
    }

    const generatedInviteCode = createInviteCode();

    const householdId = crypto.randomUUID();

    const { error: householdError } = await supabase
      .from("households")
      .insert({
        id: householdId,
        name: householdName.trim(),
        invite_code: generatedInviteCode,
        owner_id: userId,
      });

    if (householdError) {
      setIsCreating(false);
      const detailedError = `${householdError.message} (Detail: ${householdError.details || "none"}, Hint: ${householdError.hint || "none"})`;
      setErrorMessage(detailedError);
      return;
    }

    const { error: memberError } = await supabase
      .from("household_members")
      .insert({
        household_id: householdId,
        user_id: userId,
        role: "owner",
      });

    if (memberError) {
      setIsCreating(false);
      setErrorMessage(memberError.message);
      return;
    }

    await supabase.rpc("seed_default_categories", {
      target_household_id: householdId,
    });

    setIsCreating(false);
    setMessage("Household berhasil dibuat.");
    router.refresh();
  }

  async function handleJoinHousehold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsJoining(true);
    setMessage(null);
    setErrorMessage(null);

    const { error } = await supabase.rpc("join_household_by_invite_code", {
      target_invite_code: inviteCode,
    });

    setIsJoining(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Berhasil join household.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Household</p>
        <h1 className="mt-2 text-2xl font-semibold">
          Mulai keuangan bersama
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Buat household baru, atau join household pasangan dengan invite code.
        </p>
      </section>

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

      <form
        onSubmit={handleCreateHousehold}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold">Buat household</h2>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">
            Nama household
          </span>
          <input
            value={householdName}
            onChange={(event) => setHouseholdName(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
            placeholder="Contoh: Rumah Kita"
            required
          />
        </label>

        <button
          type="submit"
          disabled={isCreating}
          className="mt-4 h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isCreating ? "Membuat..." : "Buat Household"}
        </button>
      </form>

      <form
        onSubmit={handleJoinHousehold}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold">Join household</h2>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">
            Invite code
          </span>
          <input
            value={inviteCode}
            onChange={(event) =>
              setInviteCode(event.target.value.toUpperCase())
            }
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm uppercase tracking-wide outline-none focus:border-slate-950"
            placeholder="ABC123"
            required
          />
        </label>

        <button
          type="submit"
          disabled={isJoining}
          className="mt-4 h-11 w-full rounded-md border border-slate-950 px-4 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          {isJoining ? "Join..." : "Join Household"}
        </button>
      </form>
    </div>
  );
}

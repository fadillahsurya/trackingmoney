"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="h-10 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
    >
      {isLoading ? "Keluar..." : "Logout"}
    </button>
  );
}

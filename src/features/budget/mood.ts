import type { FinancialMoodStatus } from "@/lib/calculations/budget";

export const moodLabels: Record<FinancialMoodStatus, string> = {
  belum_ada_budget: "Belum Ada Budget",
  aman: "Aman",
  waspada: "Waspada",
  kritis: "Kritis",
  melebihi_batas: "Melebihi Batas",
};

export const moodMessages: Record<FinancialMoodStatus, string> = {
  belum_ada_budget: "Budget bulan ini belum diatur.",
  aman: "Aman. Pengeluaran bersama masih terkendali.",
  waspada: "Waspada. Pengeluaran bulan ini lebih cepat dari ritme aman.",
  kritis: "Kritis. Budget hampir habis sebelum akhir bulan.",
  melebihi_batas:
    "Melebihi batas. Pengeluaran bersama sudah melewati budget bulan ini.",
};

export const moodStyles: Record<FinancialMoodStatus, string> = {
  belum_ada_budget: "bg-slate-100 text-slate-700 border-slate-200",
  aman: "bg-emerald-50 text-emerald-700 border-emerald-200",
  waspada: "bg-amber-50 text-amber-700 border-amber-200",
  kritis: "bg-orange-50 text-orange-700 border-orange-200",
  melebihi_batas: "bg-red-50 text-red-700 border-red-200",
};

export type TransactionType = "contribution" | "expense" | "saving_contribution";

export const transactionTypeLabels: Record<TransactionType, string> = {
  contribution: "Kontribusi",
  expense: "Pengeluaran",
  saving_contribution: "Kontribusi Tabungan",
};

export const transactionTypeStyles: Record<TransactionType, string> = {
  contribution: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expense: "bg-red-50 text-red-700 border-red-200",
  saving_contribution: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

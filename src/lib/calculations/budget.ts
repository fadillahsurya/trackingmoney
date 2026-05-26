export type FinancialMoodStatus =
  | "belum_ada_budget"
  | "aman"
  | "waspada"
  | "kritis"
  | "melebihi_batas";

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getRemainingDaysInMonth(date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const daysInMonth = getDaysInMonth(year, month);

  return Math.max(daysInMonth - date.getDate() + 1, 0);
}

export function calculateRemainingBudget(
  monthlyBudget: number,
  totalExpense: number,
): number {
  return monthlyBudget - totalExpense;
}

export function calculateSafeDailySpend(
  monthlyBudget: number,
  totalExpense: number,
  date = new Date(),
): number {
  const remainingDays = getRemainingDaysInMonth(date);
  const remainingBudget = calculateRemainingBudget(monthlyBudget, totalExpense);

  if (remainingDays <= 0) {
    return Math.max(remainingBudget, 0);
  }

  return Math.max(remainingBudget / remainingDays, 0);
}

export function calculateBudgetUsagePercentage(
  monthlyBudget: number,
  totalExpense: number,
): number {
  if (monthlyBudget <= 0) {
    return 0;
  }

  return Math.min((totalExpense / monthlyBudget) * 100, 999);
}

export function calculateMonthProgressPercentage(date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const daysInMonth = getDaysInMonth(year, month);

  if (daysInMonth <= 0) {
    return 0;
  }

  return Math.min((date.getDate() / daysInMonth) * 100, 100);
}

export function calculateFinancialMood(
  monthlyBudget: number,
  totalExpense: number,
  date = new Date(),
): FinancialMoodStatus {
  if (monthlyBudget <= 0) {
    return "belum_ada_budget";
  }

  if (totalExpense > monthlyBudget) {
    return "melebihi_batas";
  }

  const usagePercentage = calculateBudgetUsagePercentage(
    monthlyBudget,
    totalExpense,
  );
  const monthProgressPercentage = calculateMonthProgressPercentage(date);

  if (usagePercentage <= monthProgressPercentage + 10) {
    return "aman";
  }

  if (usagePercentage <= monthProgressPercentage + 25) {
    return "waspada";
  }

  return "kritis";
}

type ExpenseTransaction = {
  amount: number;
  transaction_date: string;
  category_id?: string | null;
};

type CategoryLike = {
  id: string;
  name: string;
};

export function groupExpensesByDate(transactions: ExpenseTransaction[]) {
  const grouped = new Map<string, number>();

  transactions.forEach((transaction) => {
    const current = grouped.get(transaction.transaction_date) ?? 0;
    grouped.set(transaction.transaction_date, current + Number(transaction.amount));
  });

  return Array.from(grouped.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupExpensesByCategory(
  transactions: ExpenseTransaction[],
  categories: CategoryLike[],
) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const grouped = new Map<string, number>();

  transactions.forEach((transaction) => {
    const categoryName = transaction.category_id
      ? categoryMap.get(transaction.category_id) ?? "Lainnya"
      : "Tanpa Kategori";
    const current = grouped.get(categoryName) ?? 0;
    grouped.set(categoryName, current + Number(transaction.amount));
  });

  return Array.from(grouped.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));
}

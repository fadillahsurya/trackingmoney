"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrencyIDR } from "@/lib/utils/currency";

type ExpenseCategoryChartProps = {
  data: {
    name: string;
    amount: number;
  }[];
};

const colors = ["#ef4444", "#f59e0b", "#2563eb", "#16a34a", "#9333ea", "#64748b"];

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-md bg-slate-50 px-4 text-center text-sm text-slate-500">
        Belum ada data pengeluaran bulan ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius={46}
              outerRadius={78}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrencyIDR(Number(value ?? 0))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              {item.name}
            </span>
            <span className="font-medium text-slate-950">
              {formatCurrencyIDR(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

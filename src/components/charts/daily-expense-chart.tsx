"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyIDR } from "@/lib/utils/currency";

type DailyExpenseChartProps = {
  data: {
    date: string;
    amount: number;
  }[];
};

export function DailyExpenseChart({ data }: DailyExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-md bg-slate-50 px-4 text-center text-sm text-slate-500">
        Belum ada data pengeluaran bulan ini.
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(-2)}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => formatCurrencyIDR(Number(value ?? 0))}
            labelFormatter={(label) => `Tanggal ${String(label)}`}
          />
          <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

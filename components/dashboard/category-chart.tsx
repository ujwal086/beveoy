"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryChartPoint } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

const colors = ["#16a085", "#e86f51", "#f4b942", "#3b82f6", "#8b5cf6", "#64748b", "#17201d"];

export function CategoryChart({ data }: { data: CategoryChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-ink/20 bg-white text-sm text-ink/55">
        Spending categories will appear after transactions are added.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="amount" nameKey="category" innerRadius={54} outerRadius={92} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-2">
          {data.map((entry, index) => (
            <div key={entry.category} className="flex items-center justify-between gap-3 rounded-md bg-paper px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-ink/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                {entry.category}
              </span>
              <span className="font-semibold text-ink">{formatCurrency(entry.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

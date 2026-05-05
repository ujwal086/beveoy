"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeSeriesChartPoint } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

type RangeKey = "weekly" | "monthly" | "yearly" | "all";

type RangeData = Record<RangeKey, TimeSeriesChartPoint[]>;

const RANGE_OPTIONS: { key: RangeKey; label: string; emptyText: string }[] = [
  { key: "weekly", label: "Weekly", emptyText: "Upload a PDF to see weekly spending." },
  { key: "monthly", label: "Monthly", emptyText: "Upload a PDF to see monthly spending." },
  { key: "yearly", label: "Yearly", emptyText: "Upload a PDF to see yearly spending." },
  { key: "all", label: "All time", emptyText: "Upload a PDF to see all-time spending." }
];

export function MonthlyChart({ data }: { data: RangeData }) {
  const [selectedRange, setSelectedRange] = useState<RangeKey>("monthly");

  const activeOption = RANGE_OPTIONS.find((option) => option.key === selectedRange) ?? RANGE_OPTIONS[1];
  const activeData = useMemo(() => data[selectedRange] ?? [], [data, selectedRange]);

  if (activeData.length === 0) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedRange(option.key)}
              className={
                option.key === selectedRange
                  ? "rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                  : "rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-ink/20 bg-white text-sm text-ink/55">
          {activeOption.emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[28rem] rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelectedRange(option.key)}
            className={
              option.key === selectedRange
                ? "rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                : "rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={activeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d6" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="spending" name="Expenses" fill="#e86f51" radius={[4, 4, 0, 0]} />
          <Bar dataKey="income" name="Income" fill="#16a085" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

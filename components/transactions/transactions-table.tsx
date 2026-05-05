"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export type TransactionTableRow = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
};

export function TransactionsTable({ transactions }: { transactions: TransactionTableRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteTransaction(id: string) {
    setDeletingId(id);
    const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (response.ok) {
      router.refresh();
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/55">
        No transactions match these filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-paper text-ink/65">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-ink/70">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 font-medium text-ink">{transaction.description}</td>
                <td className="px-4 py-3 text-ink/70">{transaction.category}</td>
                <td className="px-4 py-3 capitalize text-ink/70">{transaction.type}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(Number(transaction.amount))}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => deleteTransaction(transaction.id)}
                    disabled={deletingId === transaction.id}
                    aria-label={`Delete ${transaction.description}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink hover:bg-ink/5 disabled:opacity-60"
                  >
                    {deletingId === transaction.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

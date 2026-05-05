"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

const categories = ["Food", "Rent", "Shopping", "Transport", "Subscription", "Income", "Other"];

export function ManualTransactionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("Add one-off transactions or fix anything the PDF parser missed.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Saving transaction...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formData.get("date"),
        description: formData.get("description"),
        amount: Number(formData.get("amount")),
        type: formData.get("type"),
        category: formData.get("category")
      })
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      setMessage(result.message ?? "Unable to save transaction.");
      setIsSubmitting(false);
      return;
    }

    event.currentTarget.reset();
    setMessage("Transaction saved.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Date
          <input name="date" type="date" required className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint" />
        </label>
        <label className="text-sm font-medium text-ink">
          Amount
          <input name="amount" type="number" min="0.01" step="0.01" required className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint" />
        </label>
        <label className="md:col-span-2 text-sm font-medium text-ink">
          Description
          <input name="description" type="text" required placeholder="Starbucks, rent, payroll deposit..." className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint" />
        </label>
        <label className="text-sm font-medium text-ink">
          Type
          <select name="type" defaultValue="expense" className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Category
          <select name="category" defaultValue="Other" className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/60">{message}</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add transaction
        </button>
      </div>
    </form>
  );
}

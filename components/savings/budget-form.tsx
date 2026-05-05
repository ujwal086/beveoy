"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

const categories = ["Food", "Rent", "Shopping", "Transport", "Subscription", "Other"];

export function BudgetForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("Set a monthly category limit.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("Saving budget...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: formData.get("category"),
        amount: Number(formData.get("amount"))
      })
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      setMessage(result.message ?? "Unable to save budget.");
      setIsSaving(false);
      return;
    }

    setMessage("Budget saved.");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
        <select name="category" className="rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint">
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input name="amount" type="number" min="0" step="1" placeholder="Monthly limit" className="rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint" />
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
      <p className="mt-3 text-sm text-ink/60">{message}</p>
    </form>
  );
}

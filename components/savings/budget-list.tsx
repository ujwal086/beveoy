import type { BudgetProgress } from "@/lib/savings";
import { formatCurrency } from "@/lib/utils";

export function BudgetList({ budgets }: { budgets: BudgetProgress[] }) {
  return (
    <div className="grid gap-3">
      {budgets.map((budget) => (
        <article key={budget.category} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink">{budget.category}</h3>
              <p className="text-sm text-ink/55">
                {formatCurrency(budget.spent)} of {formatCurrency(budget.budget)}
              </p>
            </div>
            <span
              className={
                budget.status === "over"
                  ? "rounded-md bg-coral/10 px-2 py-1 text-xs font-semibold text-coral"
                  : budget.status === "watch"
                    ? "rounded-md bg-saffron/20 px-2 py-1 text-xs font-semibold text-ink"
                    : "rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint"
              }
            >
              {budget.status === "over" ? "Over" : budget.status === "watch" ? "Watch" : "Good"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper">
            <div
              className={budget.status === "over" ? "h-full bg-coral" : budget.status === "watch" ? "h-full bg-saffron" : "h-full bg-mint"}
              style={{ width: `${Math.min(budget.percent, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink/55">
            {budget.remaining >= 0 ? `${formatCurrency(budget.remaining)} left this month` : `${formatCurrency(Math.abs(budget.remaining))} over budget`}
          </p>
        </article>
      ))}
    </div>
  );
}

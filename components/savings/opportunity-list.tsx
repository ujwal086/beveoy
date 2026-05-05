import type { SavingsOpportunity } from "@/lib/savings";
import { formatCurrency } from "@/lib/utils";

export function OpportunityList({ opportunities }: { opportunities: SavingsOpportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/55">
        Add transactions and budgets to reveal savings ideas.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {opportunities.map((opportunity) => (
        <article key={opportunity.title} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-ink">{opportunity.title}</h3>
            <span className="rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">
              Save {formatCurrency(opportunity.estimatedMonthlySavings)}
            </span>
          </div>
          <p className="text-sm leading-6 text-ink/65">{opportunity.detail}</p>
        </article>
      ))}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { buildBudgetProgress, findSavingsOpportunities } from "@/lib/savings";
import { BudgetForm } from "@/components/savings/budget-form";
import { BudgetList } from "@/components/savings/budget-list";
import { OpportunityList } from "@/components/savings/opportunity-list";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  try {
    const user = await getCurrentAppUser();
    const [transactions, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 500
      }),
      prisma.budget.findMany({
        where: { userId: user.id },
        orderBy: { category: "asc" }
      })
    ]);

    const budgetProgress = buildBudgetProgress(transactions, budgets);
    const opportunities = findSavingsOpportunities(transactions, budgetProgress);
    const totalPotentialSavings = opportunities.reduce((sum, opportunity) => sum + opportunity.estimatedMonthlySavings, 0);

    return (
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">Savings Coach</h1>
          <p className="mt-2 text-sm text-ink/60">Set monthly limits, spot overspending, and choose simple actions that can save money.</p>
        </div>

        <section className="mb-6 rounded-lg border border-mint/20 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-ink/60">Estimated monthly savings opportunities</p>
          <p className="mt-2 text-4xl font-semibold text-ink">${totalPotentialSavings.toFixed(0)}</p>
          <p className="mt-2 text-sm text-ink/60">Based on current budgets, subscriptions, shopping, and category patterns.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Monthly budgets</h2>
            <BudgetForm />
            <div className="mt-4">
              <BudgetList budgets={budgetProgress} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Ways to save</h2>
            <OpportunityList opportunities={opportunities} />
          </section>
        </div>
      </main>
    );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable />;
    }

    throw error;
  }
}

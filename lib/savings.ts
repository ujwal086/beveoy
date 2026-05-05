type SavingsTransactionRow = {
  amount: number | { toString(): string };
  type: string;
  category: string;
  description: string;
  date: Date | string;
};

type BudgetRow = {
  category: string;
  amount: number | { toString(): string };
};

export type BudgetProgress = {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percent: number;
  status: "good" | "watch" | "over";
};

export type SavingsOpportunity = {
  title: string;
  detail: string;
  estimatedMonthlySavings: number;
  priority: "high" | "medium" | "low";
};

const defaultBudgetCategories = ["Food", "Shopping", "Transport", "Subscription", "Other"];

export function buildBudgetProgress(transactions: SavingsTransactionRow[], budgets: BudgetRow[]): BudgetProgress[] {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const spentByCategory = new Map<string, number>();

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    if (transaction.type !== "expense" || date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) continue;
    spentByCategory.set(transaction.category, (spentByCategory.get(transaction.category) ?? 0) + Number(transaction.amount));
  }

  const budgetMap = new Map(budgets.map((budget) => [budget.category, Number(budget.amount)]));
  const categories = Array.from(new Set([...defaultBudgetCategories, ...budgetMap.keys(), ...spentByCategory.keys()]));

  return categories.map((category) => {
    const budget = budgetMap.get(category) ?? recommendedBudgetFor(category);
    const spent = spentByCategory.get(category) ?? 0;
    const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const status = percent >= 100 ? "over" : percent >= 80 ? "watch" : "good";

    return {
      category,
      budget,
      spent,
      remaining: budget - spent,
      percent,
      status
    };
  });
}

export function findSavingsOpportunities(transactions: SavingsTransactionRow[], budgetProgress: BudgetProgress[]): SavingsOpportunity[] {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const opportunities: SavingsOpportunity[] = [];
  const subscriptions = expenses.filter((transaction) => transaction.category === "Subscription");
  const subscriptionTotal = subscriptions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  if (subscriptions.length >= 2) {
    opportunities.push({
      title: "Audit recurring subscriptions",
      detail: `${subscriptions.length} subscription charges found. Canceling one unused service could free up cash quickly.`,
      estimatedMonthlySavings: Math.round((subscriptionTotal / subscriptions.length) * 100) / 100,
      priority: "high"
    });
  }

  for (const budget of budgetProgress.filter((item) => item.status === "over" || item.status === "watch")) {
    opportunities.push({
      title: `${budget.category} needs attention`,
      detail:
        budget.status === "over"
          ? `You are over this month's ${budget.category} budget by ${Math.abs(budget.remaining).toFixed(2)}.`
          : `You have used ${budget.percent}% of your ${budget.category} budget.`,
      estimatedMonthlySavings: Math.max(10, Math.round(budget.spent * 0.1)),
      priority: budget.status === "over" ? "high" : "medium"
    });
  }

  const shoppingTotal = expenses
    .filter((transaction) => transaction.category === "Shopping")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  if (shoppingTotal > 150) {
    opportunities.push({
      title: "Add a 24-hour pause to shopping",
      detail: "Shopping is high enough that delaying non-essential purchases may make a visible difference.",
      estimatedMonthlySavings: Math.round(shoppingTotal * 0.15),
      priority: "medium"
    });
  }

  return opportunities.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0, 5);
}

function recommendedBudgetFor(category: string) {
  switch (category) {
    case "Food":
      return 450;
    case "Shopping":
      return 250;
    case "Transport":
      return 200;
    case "Subscription":
      return 80;
    default:
      return 300;
  }
}

function priorityRank(priority: SavingsOpportunity["priority"]) {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}

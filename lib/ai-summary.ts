import { formatCurrency } from "@/lib/utils";

type SummaryTransaction = {
  amount: number | { toString(): string };
  type: string;
  category: string;
};

export function createMockAiSummary(transactions: SummaryTransaction[]) {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const totalMonthlySpending = expenses.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const subscriptionCount = expenses.filter(
    (transaction) => transaction.category === "Subscription"
  ).length;
  const biggestCategory = findBiggestCategory(expenses);

  if (expenses.length === 0) {
    return "Upload a statement to unlock your Beveoy summary. Once transactions appear, this card will highlight spending patterns and savings opportunities.";
  }

  return `Your biggest spending category is ${biggestCategory}. Monthly spending is ${formatCurrency(
    totalMonthlySpending
  )}. You have ${subscriptionCount} subscription transaction${
    subscriptionCount === 1 ? "" : "s"
  }. Review recurring services and large ${biggestCategory.toLowerCase()} purchases for quick saving opportunities.`;
}

function findBiggestCategory(transactions: SummaryTransaction[]) {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + Number(transaction.amount));
  }

  let topCategory = "Other";
  let topAmount = 0;

  for (const [category, amount] of totals.entries()) {
    if (amount > topAmount) {
      topCategory = category;
      topAmount = amount;
    }
  }

  return topCategory;
}

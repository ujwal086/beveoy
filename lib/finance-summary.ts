type TransactionSummaryRow = {
  amount: number | { toString(): string };
  type: string;
  category: string;
  description: string;
  date: Date | string;
};

export type TransactionSummary = {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  topSpendingCategories: { category: string; amount: number }[];
  subscriptions: { description: string; amount: number }[];
  unusualSpending: { description: string; amount: number; date: string }[];
};

export function buildTransactionSummary(transactions: TransactionSummaryRow[]): TransactionSummary {
  const totalIncome = sumByType(transactions, "income");
  const totalExpenses = sumByType(transactions, "expense");
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const categoryTotals = new Map<string, number>();

  for (const transaction of expenses) {
    categoryTotals.set(transaction.category, (categoryTotals.get(transaction.category) ?? 0) + Number(transaction.amount));
  }

  const topSpendingCategories = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const subscriptions = expenses
    .filter((transaction) => transaction.category === "Subscription")
    .map((transaction) => ({
      description: transaction.description,
      amount: Number(transaction.amount)
    }));

  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const unusualSpending = expenses
    .filter((transaction) => Number(transaction.amount) > averageExpense * 2 && Number(transaction.amount) > 50)
    .slice(0, 5)
    .map((transaction) => ({
      description: transaction.description,
      amount: Number(transaction.amount),
      date: new Date(transaction.date).toISOString().slice(0, 10)
    }));

  return {
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
    topSpendingCategories,
    subscriptions,
    unusualSpending
  };
}

function sumByType(transactions: TransactionSummaryRow[], type: string) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

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
  topExpenseDay: { label: string; amount: number } | null;
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

  const dayTotals = new Map<string, number>();
  for (const transaction of expenses) {
    const date = new Date(transaction.date).toLocaleDateString("en-US", { weekday: "long" });
    dayTotals.set(date, (dayTotals.get(date) ?? 0) + Number(transaction.amount));
  }

  const topExpenseDayEntry = Array.from(dayTotals.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
    topSpendingCategories,
    subscriptions,
    unusualSpending,
    topExpenseDay: topExpenseDayEntry
      ? {
          label: topExpenseDayEntry[0],
          amount: topExpenseDayEntry[1]
        }
      : null
  };
}

function sumByType(transactions: TransactionSummaryRow[], type: string) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

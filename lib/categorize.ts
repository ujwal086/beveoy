export type TransactionCategory =
  | "Food"
  | "Rent"
  | "Shopping"
  | "Transport"
  | "Subscription"
  | "Income"
  | "Other";

export function categorizeTransaction(description: string): TransactionCategory {
  const text = description.toLowerCase();

  if (/(walmart|target|amazon)/i.test(text)) return "Shopping";
  if (/(mcdonald|starbucks|chipotle|restaurant)/i.test(text)) return "Food";
  if (/(uber|lyft|gas|metro)/i.test(text)) return "Transport";
  if (/(netflix|spotify|youtube|apple)/i.test(text)) return "Subscription";
  if (/(salary|payroll|deposit)/i.test(text)) return "Income";

  return "Other";
}

export function inferTransactionType(description: string, amount: number): "income" | "expense" {
  const category = categorizeTransaction(description);

  if (category === "Income") {
    return "income";
  }

  if (amount < 0) return "expense";

  return "expense";
}

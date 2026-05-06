import { formatCurrency, formatDate } from "@/lib/utils";

type RecentTransactionsProps = {
  transactions: {
    id: string;
    date: Date | string;
    description: string;
    category: string;
    type: string;
    amount: number | { toString(): string };
  }[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/55">
        No transactions yet. Upload a statement to turn your latest spending into a clean activity feed.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-paper text-ink/65">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-ink/70">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 font-medium text-ink">{transaction.description}</td>
                <td className="px-4 py-3 text-ink/70">{transaction.category}</td>
                <td className="px-4 py-3 capitalize text-ink/70">{transaction.type}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatCurrency(Number(transaction.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

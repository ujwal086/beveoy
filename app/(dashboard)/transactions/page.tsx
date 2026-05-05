import Link from "next/link";
import { Download, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { ManualTransactionForm } from "@/components/transactions/manual-transaction-form";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export const dynamic = "force-dynamic";

const categories = ["All", "Food", "Rent", "Shopping", "Transport", "Subscription", "Income", "Other"];

type TransactionsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
  }>;
};

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const filters = await searchParams;
  let transactions: Awaited<ReturnType<typeof prisma.transaction.findMany>>;

  try {
    const user = await getCurrentAppUser();
    const where: {
      userId: string;
      description?: { contains: string };
      type?: string;
      category?: string;
    } = {
      userId: user.id
    };

    if (filters.q) {
      where.description = { contains: filters.q };
    }

    if (filters.type === "income" || filters.type === "expense") {
      where.type = filters.type;
    }

    if (filters.category && filters.category !== "All") {
      where.category = filters.category;
    }

    transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: 500
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable />;
    }

    throw error;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Transactions</h1>
          <p className="mt-2 text-sm text-ink/60">Review, add, filter, delete, and export your financial activity.</p>
        </div>
        <Link href="/api/transactions/export" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90">
          <Download className="h-4 w-4" /> Export CSV
        </Link>
      </div>

      <ManualTransactionForm />

      <form className="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_220px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={filters.q ?? ""} placeholder="Search descriptions" className="w-full rounded-md border border-ink/10 py-2 pl-9 pr-3 text-sm outline-none focus:border-mint" />
        </label>
        <select name="type" defaultValue={filters.type ?? "all"} className="rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint">
          <option value="all">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
        <select name="category" defaultValue={filters.category ?? "All"} className="rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint">
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All categories" : category}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
          Filter
        </button>
      </form>

      <section className="mt-6">
        <TransactionsTable
          transactions={transactions.map((transaction) => ({
            id: transaction.id,
            date: transaction.date.toISOString(),
            description: transaction.description,
            amount: Number(transaction.amount),
            type: transaction.type,
            category: transaction.category
          }))}
        />
      </section>
    </main>
  );
}

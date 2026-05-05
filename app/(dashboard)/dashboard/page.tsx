import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Download, PiggyBank, Plus, ShieldCheck, Tag, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/user";
import { createMockAiSummary } from "@/lib/ai-summary";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AiSummaryCard } from "@/components/dashboard/ai-summary-card";
import { AiInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import { CategoryChart } from "@/components/dashboard/category-chart";
import type { CategoryChartPoint, TimeSeriesChartPoint } from "@/types/dashboard";
import { isDatabaseConnectionError } from "@/lib/db-errors";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { buildBudgetProgress, findSavingsOpportunities } from "@/lib/savings";
import { isPremiumStatus } from "@/lib/plans";
import { PremiumLock } from "@/components/premium-lock";

export const dynamic = "force-dynamic";

type DashboardTransaction = Awaited<ReturnType<typeof prisma.transaction.findMany>>[number];

export default async function DashboardPage() {
  let transactions: DashboardTransaction[];
  let latestAiSummary: string | null = null;
  let budgets = [];
  let premiumEnabled = false;

  try {
    const user = await getCurrentAppUser();
    const [transactionRows, latestFile, budgetRows] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" }
      }),
      prisma.uploadedFile.findFirst({
        where: {
          userId: user.id,
          aiSummary: { not: null }
        },
        orderBy: { createdAt: "desc" },
        select: { aiSummary: true }
      }),
      prisma.budget.findMany({
        where: { userId: user.id }
      })
    ]);

    transactions = transactionRows;
    latestAiSummary = latestFile?.aiSummary ?? null;
    budgets = budgetRows;
    premiumEnabled = isPremiumStatus(user.subscriptionStatus);
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable />;
    }

    throw error;
  }

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const savings = income - expenses;
  const topCategory = getTopSpendingCategory(transactions);
  const chartData = buildChartData(transactions);
  const categoryData = buildCategoryChart(transactions);
  const budgetProgress = buildBudgetProgress(transactions, budgets);
  const savingsOpportunities = findSavingsOpportunities(transactions, budgetProgress);
  const summary = latestAiSummary ?? createMockAiSummary(transactions);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-ink/60">Your uploaded PDFs become transactions, charts, and plain-English insight.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/upload" className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/90">
            <Upload className="h-4 w-4" /> Upload
          </Link>
          <Link href="/transactions" className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
            <Plus className="h-4 w-4" /> Add
          </Link>
          <Link href="/api/transactions/export" className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
            <Download className="h-4 w-4" /> CSV
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total income" value={formatCurrency(income)} detail="Across uploaded documents" icon={ArrowUpCircle} />
        <StatCard label="Total expenses" value={formatCurrency(expenses)} detail="Categorized statement activity" icon={ArrowDownCircle} />
        <StatCard label="Savings" value={formatCurrency(savings)} detail="Income minus expenses" icon={PiggyBank} />
        <StatCard label="Top category" value={topCategory} detail="Highest expense category" icon={Tag} />
      </div>

      <section className="mt-8 rounded-lg border border-mint/20 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-mint" />
              <h2 className="text-lg font-semibold text-ink">Savings Coach</h2>
            </div>
            <p className="text-sm leading-6 text-ink/65">
              {savingsOpportunities[0]?.detail ?? "Set budgets and add transactions to reveal money-saving recommendations."}
            </p>
          </div>
          <Link href="/savings" className="inline-flex items-center justify-center rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white hover:bg-mint/90">
            Open coach
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="xl:row-span-2">
          <h2 className="mb-3 text-lg font-semibold text-ink">Spending trends</h2>
          <MonthlyChart data={chartData} />
        </section>
        {premiumEnabled ? <AiInsightsPanel enabled /> : <PremiumLock title="AI insights are locked" detail="Upgrade to Pro to get plain-English spending analysis, unusual spending detection, and saving suggestions." />}
        <AiSummaryCard summary={summary} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-ink">Category breakdown</h2>
        <CategoryChart data={categoryData} />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Recent transactions</h2>
          <Link href="/transactions" className="text-sm font-semibold text-mint hover:text-mint/80">
            View all
          </Link>
        </div>
        <RecentTransactions transactions={transactions.slice(0, 10)} />
      </section>
    </main>
  );
}

function buildCategoryChart(transactions: DashboardTransaction[]): CategoryChartPoint[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + Number(transaction.amount));
  }

  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 7);
}

function getTopSpendingCategory(transactions: DashboardTransaction[]) {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
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

  return topAmount === 0 ? "None yet" : topCategory;
}

function buildChartData(transactions: DashboardTransaction[]) {
  return {
    weekly: buildTimeSeries(transactions, "weekly"),
    monthly: buildTimeSeries(transactions, "monthly"),
    yearly: buildTimeSeries(transactions, "yearly"),
    all: buildTimeSeries(transactions, "all")
  };
}

function buildTimeSeries(
  transactions: DashboardTransaction[],
  range: "weekly" | "monthly" | "yearly" | "all"
): TimeSeriesChartPoint[] {
  const buckets = new Map<string, { sortValue: number; point: TimeSeriesChartPoint }>();

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    const bucket = getBucket(date, range);
    const existing = buckets.get(bucket.key) ?? {
      sortValue: bucket.sortValue,
      point: { label: bucket.label, spending: 0, income: 0 }
    };

    if (transaction.type === "expense") {
      existing.point.spending += Number(transaction.amount);
    } else {
      existing.point.income += Number(transaction.amount);
    }

    buckets.set(bucket.key, existing);
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => a.sortValue - b.sortValue)
    .map((entry) => entry.point);

  if (range === "weekly") return sorted.slice(-8);
  if (range === "monthly") return sorted.slice(-12);
  return sorted;
}

function getBucket(date: Date, range: "weekly" | "monthly" | "yearly" | "all") {
  if (range === "weekly") {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return {
      key: `week-${startOfWeek.toISOString()}`,
      label: startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sortValue: startOfWeek.getTime()
    };
  }

  if (range === "monthly") {
    return {
      key: `month-${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      sortValue: new Date(date.getFullYear(), date.getMonth(), 1).getTime()
    };
  }

  if (range === "yearly") {
    return {
      key: `year-${date.getFullYear()}`,
      label: String(date.getFullYear()),
      sortValue: new Date(date.getFullYear(), 0, 1).getTime()
    };
  }

  return {
    key: `all-${date.getFullYear()}-${date.getMonth()}`,
    label: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
    sortValue: new Date(date.getFullYear(), date.getMonth(), 1).getTime()
  };
}

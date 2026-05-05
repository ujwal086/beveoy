import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, Bot, CreditCard, ListChecks, PiggyBank, Upload } from "lucide-react";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isPremiumStatus } from "@/lib/plans";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUserOrNull();
  const isPremium = isPremiumStatus(user?.subscriptionStatus ?? "inactive");

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-semibold text-ink">
              Beveoy
            </Link>
            <span className={isPremium ? "rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint" : "rounded-md bg-paper px-2 py-1 text-xs font-semibold text-ink/60"}>
              {isPremium ? "Pro" : "Free"}
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5" href="/dashboard">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5" href="/upload">
              <Upload className="h-4 w-4" /> Upload
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5" href="/transactions">
              <ListChecks className="h-4 w-4" /> Transactions
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5" href="/savings">
              <PiggyBank className="h-4 w-4" /> Savings
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5" href="/coach">
              <Bot className="h-4 w-4" /> Coach
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5" href="/pricing">
              <CreditCard className="h-4 w-4" /> Pricing
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

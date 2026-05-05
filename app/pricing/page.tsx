import { getCurrentAppUserOrNull } from "@/lib/user";
import { isPremiumStatus } from "@/lib/plans";
import { PricingCards } from "@/components/billing/pricing-cards";
import { BillingStatus } from "@/components/billing/billing-status";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getCurrentAppUserOrNull();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-ink">Pricing</h1>
        <p className="mt-2 text-sm text-ink/60">Choose a plan that fits how deeply you want Beveoy to analyze and coach your finances.</p>
      </div>
      {user ? (
        <div className="mb-6">
          <BillingStatus
            plan={user.plan}
            subscriptionStatus={user.subscriptionStatus}
            trialEndsAt={user.trialEndsAt}
            currentPeriodEnd={user.currentPeriodEnd}
          />
        </div>
      ) : null}
      <PricingCards currentPlan={user?.plan ?? "free"} hasPremium={isPremiumStatus(user?.subscriptionStatus ?? "inactive")} />
    </main>
  );
}

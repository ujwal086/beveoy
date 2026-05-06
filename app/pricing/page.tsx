import { getCurrentAppUserOrNull } from "@/lib/user";
import { isPremiumStatus } from "@/lib/plans";
import { PricingCards } from "@/components/billing/pricing-cards";
import { BillingStatus } from "@/components/billing/billing-status";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getCurrentAppUserOrNull();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-4xl font-semibold text-ink">Pricing</h1>
        <p className="mt-2 text-base leading-7 text-ink/60">
          Start free, upload your first statements, and upgrade when you want deeper savings suggestions, subscription detection, and an AI coach that keeps up with your money habits.
        </p>
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

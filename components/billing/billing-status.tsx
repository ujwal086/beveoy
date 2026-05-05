import { formatDate } from "@/lib/utils";

export function BillingStatus({
  plan,
  subscriptionStatus,
  trialEndsAt,
  currentPeriodEnd
}: {
  plan: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Billing status</h2>
      <div className="mt-4 grid gap-3 text-sm text-ink/65 sm:grid-cols-2">
        <p>Current plan: <span className="font-semibold text-ink">{plan}</span></p>
        <p>Status: <span className="font-semibold capitalize text-ink">{subscriptionStatus}</span></p>
        <p>Trial ends: <span className="font-semibold text-ink">{trialEndsAt ? formatDate(trialEndsAt) : "N/A"}</span></p>
        <p>Renewal date: <span className="font-semibold text-ink">{currentPeriodEnd ? formatDate(currentPeriodEnd) : "N/A"}</span></p>
      </div>
    </section>
  );
}

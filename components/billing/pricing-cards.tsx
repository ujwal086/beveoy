"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type PricingCardsProps = {
  currentPlan: string;
  hasPremium: boolean;
};

export function PricingCards({ currentPlan, hasPremium }: PricingCardsProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [redeemingPromo, setRedeemingPromo] = useState(false);

  async function startCheckout(plan: "monthly" | "yearly") {
    setLoadingPlan(plan);
    setMessage(null);
    const response = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const result = (await response.json()) as { url?: string; message?: string };

    if (result.url) {
      window.location.href = result.url;
      return;
    }

    setLoadingPlan(null);
    setMessage(result.message ?? "Unable to start checkout right now.");
  }

  async function redeemPromoCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRedeemingPromo(true);
    setMessage(null);

    const response = await fetch("/api/billing/redeem-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode })
    });

    const result = (await response.json()) as { message?: string };

    setRedeemingPromo(false);
    setMessage(result.message ?? "Promo code processed.");

    if (response.ok) {
      setPromoCode("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {message ? <div className="rounded-lg border border-coral/20 bg-white px-4 py-3 text-sm text-coral shadow-sm">{message}</div> : null}
      <div className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Free</h2>
        <p className="mt-2 text-4xl font-semibold text-ink">$0</p>
        <div className="mt-4 space-y-2 text-sm text-ink/65">
          <p>Basic dashboard</p>
          <p>3 PDF uploads/month</p>
          <p>No AI insights</p>
          <p>No AI coach</p>
        </div>
        <button disabled className="mt-6 w-full rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
          {currentPlan === "free" ? "Current Plan" : "Free Plan"}
        </button>
      </article>

      <article className="rounded-lg border border-mint/30 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Pro Monthly</h2>
        <p className="mt-2 text-4xl font-semibold text-ink">$15<span className="text-base font-medium text-ink/55">/month</span></p>
        <div className="mt-4 space-y-2 text-sm text-ink/65">
          <p>3-day free trial</p>
          <p>Unlimited uploads</p>
          <p>AI insights</p>
          <p>AI coach</p>
        </div>
        <button
          onClick={() => startCheckout("monthly")}
          disabled={loadingPlan !== null || currentPlan === "pro_monthly" || hasPremium}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {loadingPlan === "monthly" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {currentPlan === "pro_monthly" || hasPremium ? "Current Plan" : "Start Monthly Trial"}
        </button>
      </article>

      <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Pro Yearly</h2>
        <p className="mt-2 text-4xl font-semibold text-ink">$90<span className="text-base font-medium text-ink/55">/year</span></p>
        <div className="mt-4 space-y-2 text-sm text-ink/65">
          <p>3-day free trial</p>
          <p>Save 50% vs monthly</p>
          <p>Unlimited uploads</p>
          <p>AI insights and AI coach</p>
        </div>
        <button
          onClick={() => startCheckout("yearly")}
          disabled={loadingPlan !== null || currentPlan === "pro_yearly" || hasPremium}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white hover:bg-mint/90 disabled:opacity-60"
        >
          {loadingPlan === "yearly" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {currentPlan === "pro_yearly" || hasPremium ? "Current Plan" : "Start Yearly Trial"}
        </button>
      </article>
      </div>

      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-ink">Promo code</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Have a promo code? Apply it here to unlock Pro access on your signed-in account.
          </p>
          <form onSubmit={redeemPromoCode} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder="Enter promo code"
              className="w-full rounded-md border border-ink/10 px-3 py-2 text-sm outline-none focus:border-mint"
            />
            <button
              type="submit"
              disabled={redeemingPromo || promoCode.trim().length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
            >
              {redeemingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Apply code
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

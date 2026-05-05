"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type SyncState = "idle" | "syncing" | "success" | "error";

export function CheckoutSuccessCard() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<SyncState>(sessionId ? "syncing" : "idle");
  const [message, setMessage] = useState("We're syncing your subscription now.");

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function syncCheckout() {
      try {
        const response = await fetch("/api/billing/confirm-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });

        const result = (await response.json()) as { message?: string; plan?: string; subscriptionStatus?: string };

        if (!response.ok) {
          throw new Error(result.message || "Unable to confirm checkout yet.");
        }

        if (cancelled) return;

        setState("success");
        setMessage(
          result.subscriptionStatus === "trialing"
            ? `Your ${formatPlan(result.plan)} trial is active.`
            : `Your ${formatPlan(result.plan)} subscription is active.`
        );
      } catch (error) {
        if (cancelled) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "Unable to confirm checkout yet.");
      }
    }

    void syncCheckout();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const title = useMemo(() => {
    if (state === "success") return "Subscription ready";
    if (state === "error") return "Checkout complete";
    return "Checkout complete";
  }, [state]);

  return (
    <section className="rounded-lg border border-mint/20 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-ink/65">{message}</p>
      {state === "syncing" ? <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink/10"><div className="h-full w-1/2 animate-pulse rounded-full bg-mint" /></div> : null}
      {state === "error" ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your Stripe checkout finished, but Beveoy could not sync the plan yet. Refresh in a few seconds or make sure the webhook is connected for automatic updates.
        </p>
      ) : null}
      <div className="mt-5 flex gap-3">
        <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90">
          Back to dashboard
        </Link>
        <Link href="/pricing" className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
          Billing
        </Link>
      </div>
    </section>
  );
}

function formatPlan(plan?: string) {
  if (plan === "pro_yearly") return "Pro Yearly";
  if (plan === "pro_monthly") return "Pro Monthly";
  return "Pro";
}

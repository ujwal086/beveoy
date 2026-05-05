import { Suspense } from "react";
import { CheckoutSuccessCard } from "@/components/billing/checkout-success-card";

export default function BillingSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-12 lg:px-8">
      <Suspense fallback={<section className="rounded-lg border border-mint/20 bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold text-ink">Checkout complete</h1><p className="mt-3 text-sm leading-6 text-ink/65">We&apos;re syncing your subscription now.</p></section>}>
        <CheckoutSuccessCard />
      </Suspense>
    </main>
  );
}

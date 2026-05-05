import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-guards";
import { getStripe } from "@/lib/stripe";
import { normalizePlanForStripe } from "@/lib/plans";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { resolveAppUrl } from "@/lib/app-url";

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  try {
    const rateLimit = checkRateLimit(`billing-checkout:${auth.user.id}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Too many checkout attempts right now. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = (await request.json()) as { plan?: string };
    const selectedPlan = body.plan;

    if (selectedPlan !== "monthly" && selectedPlan !== "yearly") {
      return NextResponse.json({ message: "Invalid billing plan." }, { status: 400 });
    }

    const priceId =
      selectedPlan === "monthly" ? process.env.STRIPE_MONTHLY_PRICE_ID : process.env.STRIPE_YEARLY_PRICE_ID;
    const appUrl = resolveAppUrl(request);

    if (!priceId || !appUrl) {
      return NextResponse.json({ message: "Stripe is not configured yet." }, { status: 500 });
    }

    const stripe = getStripe();
    let customerId = auth.user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email ?? undefined,
        name: auth.user.name ?? undefined,
        metadata: { userId: auth.user.id }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: auth.user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          userId: auth.user.id,
          billingPlan: normalizePlanForStripe(selectedPlan)
        }
      },
      metadata: {
        userId: auth.user.id,
        billingPlan: normalizePlanForStripe(selectedPlan)
      },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`
    });

    return NextResponse.json({ url: session.url }, { headers: rateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to create checkout session." }, { status: 500 });
  }
}

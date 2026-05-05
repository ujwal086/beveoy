import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { FREE_UPLOAD_LIMIT, AppPlan, resolveUploadLimit } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return null;

  return prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
      stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null
    }
  });
}

export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId || undefined;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : undefined;
  const plan = subscription.metadata.billingPlan || inferPlanFromSubscription(subscription);

  const user = userId
    ? await prisma.user.findFirst({ where: { id: userId } })
    : customerId
      ? await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
      : null;

  if (!user) return null;

  if (subscription.status === "canceled") {
    return prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "free",
        subscriptionStatus: "canceled",
        stripeSubscriptionId: null,
        trialEndsAt: null,
        currentPeriodEnd: null,
        uploadLimit: FREE_UPLOAD_LIMIT
      }
    });
  }

  const status = mapStripeStatus(subscription.status);
  return prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      subscriptionStatus: status,
      stripeCustomerId: customerId ?? user.stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      currentPeriodEnd: new Date(
        subscription.items.data[0]?.current_period_end ? subscription.items.data[0].current_period_end * 1000 : Date.now()
      ),
      uploadLimit: resolveUploadLimit(plan, status)
    }
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionValue = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
  const subscriptionId = typeof subscriptionValue === "string" ? subscriptionValue : null;
  if (!subscriptionId) return null;

  return prisma.user.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { subscriptionStatus: "active", uploadLimit: resolveUploadLimit("pro_monthly", "active") }
  });
}

export async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const subscriptionValue = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
  const subscriptionId = typeof subscriptionValue === "string" ? subscriptionValue : null;
  if (!subscriptionId) return null;

  return prisma.user.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { subscriptionStatus: "past_due", uploadLimit: FREE_UPLOAD_LIMIT }
  });
}

export async function confirmCheckoutSessionForUser(userId: string, sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });

  if (session.mode !== "subscription") {
    throw new Error("This checkout session is not a subscription.");
  }

  const sessionUserId = session.metadata?.userId;
  const customerId = typeof session.customer === "string" ? session.customer : null;

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new Error("User not found.");
  }

  const belongsToUser =
    sessionUserId === userId ||
    (customerId && existingUser.stripeCustomerId && customerId === existingUser.stripeCustomerId);

  if (!belongsToUser) {
    throw new Error("This checkout session does not belong to the current user.");
  }

  await handleCheckoutCompleted(session);

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

  if (!subscription) {
    throw new Error("Subscription details are not available yet.");
  }

  const syncedUser = await handleSubscriptionChange(subscription);
  return syncedUser;
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  if (status === "trialing") return "trialing";
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") return "canceled";
  return "inactive";
}

function inferPlanFromSubscription(subscription: Stripe.Subscription): AppPlan {
  const interval = subscription.items.data[0]?.price.recurring?.interval;
  return interval === "year" ? "pro_yearly" : "pro_monthly";
}

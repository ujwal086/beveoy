import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth-guards";
import { confirmCheckoutSessionForUser } from "@/lib/billing";

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  try {
    const body = (await request.json()) as { sessionId?: string };

    if (!body.sessionId) {
      return NextResponse.json({ message: "Missing session ID." }, { status: 400 });
    }

    const user = await confirmCheckoutSessionForUser(auth.user.id, body.sessionId);
    return NextResponse.json({
      message: "Billing synced.",
      plan: user?.plan ?? auth.user.plan,
      subscriptionStatus: user?.subscriptionStatus ?? auth.user.subscriptionStatus,
      trialEndsAt: user?.trialEndsAt ?? null,
      currentPeriodEnd: user?.currentPeriodEnd ?? null
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to confirm checkout yet." }, { status: 500 });
  }
}

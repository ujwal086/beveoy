import { NextResponse } from "next/server";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isPremiumStatus } from "@/lib/plans";

export async function requireAuthUser() {
  const user = await getCurrentAppUserOrNull();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ message: "You must be signed in." }, { status: 401 })
    };
  }

  return { user, response: null };
}

export async function requirePremiumUser() {
  const auth = await requireAuthUser();
  if (!auth.user) return auth;

  if (!isPremiumStatus(auth.user.subscriptionStatus)) {
    return {
      user: null,
      response: NextResponse.json({ message: "Upgrade to Pro to access this feature." }, { status: 403 })
    };
  }

  return { user: auth.user, response: null };
}

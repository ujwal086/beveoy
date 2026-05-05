import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { resolveUploadLimit } from "@/lib/plans";

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth.response) return auth.response;

  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim();
    const promoCode = process.env.PROMO_CODE?.trim();

    if (!code) {
      return NextResponse.json({ message: "Promo code is required." }, { status: 400 });
    }

    if (!promoCode) {
      return NextResponse.json({ message: "Promo code is not configured yet." }, { status: 500 });
    }

    if (code !== promoCode) {
      return NextResponse.json({ message: "Invalid promo code." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        plan: "pro_yearly",
        subscriptionStatus: "active",
        trialEndsAt: null,
        currentPeriodEnd: null,
        uploadLimit: resolveUploadLimit("pro_yearly", "active")
      }
    });

    return NextResponse.json({
      message: "Promo code applied. Pro access is now active.",
      plan: updatedUser.plan,
      subscriptionStatus: updatedUser.subscriptionStatus
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to redeem promo code." }, { status: 500 });
  }
}

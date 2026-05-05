import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";

const allowedCategories = ["Food", "Rent", "Shopping", "Transport", "Subscription", "Income", "Other"];

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUserOrNull();
    if (!user) {
      return NextResponse.json({ message: "You must be signed in to set budgets." }, { status: 401 });
    }

    const body = (await request.json()) as { category?: string; amount?: number };
    const category = body.category;
    const amount = Number(body.amount);

    if (!category || !allowedCategories.includes(category) || !Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ message: "Choose a valid category and budget amount." }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category
        }
      },
      update: { amount },
      create: {
        userId: user.id,
        category,
        amount
      }
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: "Database is not available." }, { status: 503 });
    }

    return NextResponse.json({ message: "Unable to save budget." }, { status: 500 });
  }
}

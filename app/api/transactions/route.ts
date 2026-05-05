import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorizeTransaction } from "@/lib/categorize";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";

const categories = ["Food", "Rent", "Shopping", "Transport", "Subscription", "Income", "Other"] as const;
const types = ["income", "expense"] as const;

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUserOrNull();
    if (!user) {
      return NextResponse.json({ message: "You must be signed in to add transactions." }, { status: 401 });
    }

    const body = (await request.json()) as {
      date?: string;
      description?: string;
      amount?: number;
      type?: string;
      category?: string;
    };

    const description = body.description?.trim();
    const amount = Number(body.amount);
    const date = body.date ? new Date(body.date) : null;
    const type: "income" | "expense" = types.includes(body.type as (typeof types)[number])
      ? (body.type as "income" | "expense")
      : "expense";
    const category: string = categories.includes(body.category as (typeof categories)[number])
      ? (body.category as string)
      : categorizeTransaction(description ?? "");

    if (!description || !date || Number.isNaN(date.getTime()) || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Date, description, and a positive amount are required." }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        date,
        description,
        amount,
        type,
        category
      }
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: "Database is not available." }, { status: 503 });
    }

    return NextResponse.json({ message: "Unable to add this transaction." }, { status: 500 });
  }
}

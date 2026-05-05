import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";

export async function GET() {
  try {
    const user = await getCurrentAppUserOrNull();
    if (!user) {
      return NextResponse.json({ message: "You must be signed in to export transactions." }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" }
    });

    const rows = [
      ["date", "description", "amount", "type", "category"],
      ...transactions.map((transaction) => [
        transaction.date.toISOString().slice(0, 10),
        transaction.description,
        Number(transaction.amount).toFixed(2),
        transaction.type,
        transaction.category
      ])
    ];

    return new Response(rows.map((row) => row.map(escapeCsv).join(",")).join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=beveoy-transactions.csv"
      }
    });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: "Database is not available." }, { status: 503 });
    }

    return NextResponse.json({ message: "Unable to export transactions." }, { status: 500 });
  }
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

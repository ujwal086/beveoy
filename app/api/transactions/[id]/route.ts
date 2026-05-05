import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentAppUserOrNull();
    if (!user) {
      return NextResponse.json({ message: "You must be signed in to delete transactions." }, { status: 401 });
    }

    const { id } = await params;
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id
      },
      select: { id: true }
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found." }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id: transaction.id }
    });

    return NextResponse.json({ message: "Transaction deleted." });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: "Database is not available." }, { status: 503 });
    }

    return NextResponse.json({ message: "Unable to delete this transaction." }, { status: 500 });
  }
}

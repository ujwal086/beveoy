import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { isDatabaseConnectionError } from "@/lib/db-errors";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentAppUserOrNull();
    if (!user) {
      return NextResponse.json({ message: "You must be signed in to delete files." }, { status: 401 });
    }

    const { id } = await params;

    const file = await prisma.uploadedFile.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!file) {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: {
          userId: user.id,
          uploadedFileId: file.id
        }
      }),
      prisma.uploadedFile.delete({
        where: { id: file.id }
      })
    ]);

    const monthlyUploads = await prisma.uploadedFile.count({
      where: {
        userId: user.id,
        createdAt: { gte: startOfMonth }
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        uploadsUsed: monthlyUploads
      }
    });

    return NextResponse.json({ message: "File deleted." });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: "Database is not running. Start PostgreSQL and run migrations." }, { status: 503 });
    }

    return NextResponse.json({ message: "Unable to delete this file." }, { status: 500 });
  }
}

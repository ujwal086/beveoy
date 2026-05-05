import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUserOrNull } from "@/lib/user";
import { extractTextFromPdf, parseTransactionsFromText } from "@/lib/pdf";
import { isDatabaseConnectionError } from "@/lib/db-errors";
import { analyzeStatementWithAi } from "@/lib/openai-finance";
import { FREE_UPLOAD_LIMIT, isPremiumStatus, resolveUploadLimit } from "@/lib/plans";
import { createMockAiSummary } from "@/lib/ai-summary";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUserOrNull();
    if (!user) {
      return NextResponse.json({ message: "You must be signed in to upload PDFs." }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`upload:${user.id}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Too many uploads right now. Please wait a bit and try again." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "A PDF file is required." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ message: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ message: "PDFs must be 10 MB or smaller." }, { status: 400 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUploads = await prisma.uploadedFile.count({
      where: {
        userId: user.id,
        createdAt: { gte: startOfMonth }
      }
    });

    const uploadLimit = resolveUploadLimit(user.plan, user.subscriptionStatus);
    if (!isPremiumStatus(user.subscriptionStatus) && monthlyUploads >= FREE_UPLOAD_LIMIT) {
      return NextResponse.json({ message: "Upgrade to Pro to unlock unlimited PDF uploads." }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedText = await extractTextFromPdf(buffer);
    const aiAnalysis = isPremiumStatus(user.subscriptionStatus) ? await analyzeStatementWithAi(extractedText) : null;
    const parsedTransactions =
      aiAnalysis && aiAnalysis.transactions.length > 0 ? aiAnalysis.transactions : parseTransactionsFromText(extractedText);
    const summaryText = aiAnalysis?.summaryText ?? createMockAiSummary(parsedTransactions);

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId: user.id,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        extractedText,
        aiSummary: summaryText,
        transactions: {
          create: parsedTransactions.map((transaction) => ({
            userId: user.id,
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category
          }))
        }
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        uploadsUsed: monthlyUploads + 1,
        uploadLimit
      }
    });

    return NextResponse.json({
      id: uploadedFile.id,
      transactionCount: parsedTransactions.length,
      message: aiAnalysis ? "PDF analyzed with AI successfully." : "PDF uploaded and summarized successfully."
    }, { headers: rateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: "Database is not running. Start PostgreSQL and run migrations." }, { status: 503 });
    }

    return NextResponse.json({ message: "Unable to process this PDF." }, { status: 500 });
  }
}

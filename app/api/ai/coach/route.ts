import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePremiumUser } from "@/lib/auth-guards";
import { buildTransactionSummary } from "@/lib/finance-summary";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const auth = await requirePremiumUser();
  if (auth.response) return auth.response;

  try {
    const rateLimit = checkRateLimit(`ai-coach:${auth.user.id}`, 30, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Too many AI coach requests right now. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();

    if (!message || message.length < 3) {
      return NextResponse.json({ message: "Please ask a clearer question." }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: auth.user.id },
      orderBy: { date: "desc" },
      take: 300
    });
    const summary = buildTransactionSummary(transactions);
    const answer = await generateCoachAnswer(message, summary);

    return NextResponse.json({ answer }, { headers: rateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to respond right now." }, { status: 500 });
  }
}

async function generateCoachAnswer(message: string, summary: ReturnType<typeof buildTransactionSummary>) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackCoachAnswer(message, summary);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      max_output_tokens: 900,
      input: [
        {
          role: "system",
          content:
            "You are a simple, safe, beginner-friendly financial coach. Answer in plain English. Give practical budgeting advice only. Never guarantee affordability or outcomes. If something depends on missing details, say what is missing and give a cautious rule of thumb."
        },
        {
          role: "user",
          content: `Question: ${message}\n\nTransaction summary: ${JSON.stringify(summary)}`
        }
      ]
    })
  });

  if (!response.ok) {
    return fallbackCoachAnswer(message, summary);
  }

  const data = await response.json();
  return readOutputText(data) ?? fallbackCoachAnswer(message, summary);
}

function fallbackCoachAnswer(message: string, summary: ReturnType<typeof buildTransactionSummary>) {
  const lower = message.toLowerCase();

  if (lower.includes("wasting money")) {
    const topCategory = summary.topSpendingCategories[0];
    return topCategory
      ? `Your biggest place to review is ${topCategory.category}, where you spent about $${topCategory.amount.toFixed(2)}. Start there, then look at subscriptions and impulse shopping.`
      : "You need a bit more transaction history before I can point to a clear area of waste.";
  }

  if (lower.includes("afford")) {
    return `A safe rule is to compare the purchase with your current savings margin. You are at about $${summary.savings.toFixed(2)} after income minus expenses, so make sure the purchase still leaves room for bills and emergencies.`;
  }

  if (lower.includes("save")) {
    return `To save more this month, start with subscriptions, your biggest spending category, and any unusual recent expenses. Cutting a few recurring charges plus one discretionary category is usually the fastest path.`;
  }

  return `Your income is about $${summary.totalIncome.toFixed(2)} and expenses are about $${summary.totalExpenses.toFixed(2)}. A practical next step is to trim your top spending category and review recurring subscriptions.`;
}

function readOutputText(response: unknown) {
  if (!response || typeof response !== "object" || !("output" in response) || !Array.isArray(response.output)) {
    return null;
  }

  for (const item of response.output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

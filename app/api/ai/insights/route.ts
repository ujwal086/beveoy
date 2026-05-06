import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePremiumUser } from "@/lib/auth-guards";
import { buildTransactionSummary } from "@/lib/finance-summary";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST() {
  const auth = await requirePremiumUser();
  if (auth.response) return auth.response;

  try {
    const rateLimit = checkRateLimit(`ai-insights:${auth.user.id}`, 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Too many AI insight requests right now. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: auth.user.id },
      orderBy: { date: "desc" },
      take: 300
    });
    const summary = buildTransactionSummary(transactions);
    const insights = await generateInsights(summary);

    return NextResponse.json({ insights }, { headers: rateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to generate AI insights." }, { status: 500 });
  }
}

async function generateInsights(summary: ReturnType<typeof buildTransactionSummary>) {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackInsights(summary);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      max_output_tokens: 700,
      input: [
        {
          role: "system",
          content:
            "You are a beginner-friendly financial analyst. Give short, clear, practical insights. Avoid jargon. Do not give legal, tax, or high-risk investing advice. Focus on income, spending, subscriptions, unusual spending, and simple saving opportunities."
        },
        {
          role: "user",
          content: `Create 4 to 6 short financial insights from this summary: ${JSON.stringify(summary)}`
        }
      ]
    })
  });

  if (!response.ok) {
    return buildFallbackInsights(summary);
  }

  const data = await response.json();
  const text = readOutputText(data);
  if (!text) return buildFallbackInsights(summary);

  return text
    .split(/\n+/)
    .map((line: string) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildFallbackInsights(summary: ReturnType<typeof buildTransactionSummary>) {
  const insights = [];
  const topCategory = summary.topSpendingCategories[0];
  const secondCategory = summary.topSpendingCategories[1];
  const subscriptionTotal = summary.subscriptions.reduce((sum, subscription) => sum + subscription.amount, 0);

  if (topCategory) {
    insights.push(`Your biggest category is ${topCategory.category} at $${topCategory.amount.toFixed(2)}, so that is the first place to tighten spending.`);
  }

  if (subscriptionTotal > 0) {
    insights.push(
      `You have ${summary.subscriptions.length} subscriptions totaling about $${subscriptionTotal.toFixed(2)} each cycle. Canceling unused ones could unlock fast savings.`
    );
  }

  if (summary.topExpenseDay) {
    insights.push(
      `Your highest spending day was ${summary.topExpenseDay.label}, where you spent about $${summary.topExpenseDay.amount.toFixed(2)}.`
    );
  }

  if (topCategory && secondCategory) {
    const possibleSavings = (topCategory.amount + secondCategory.amount) * 0.15;
    insights.push(
      `Reducing ${topCategory.category.toLowerCase()} and ${secondCategory.category.toLowerCase()} by 15% could save about $${possibleSavings.toFixed(2)} this month.`
    );
  }

  if (summary.unusualSpending[0]) {
    insights.push(
      `${summary.unusualSpending[0].description} stands out as a larger expense at $${summary.unusualSpending[0].amount.toFixed(2)}. Review whether it was one-off or repeatable.`
    );
  }

  insights.push(
    summary.savings >= 0
      ? `You are currently keeping about $${summary.savings.toFixed(2)} after income and expenses.`
      : `You are overspending by about $${Math.abs(summary.savings).toFixed(2)} right now, so trimming just one major category will help quickly.`
  );
  return insights;
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

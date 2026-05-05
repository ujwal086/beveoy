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
  insights.push(`You brought in $${summary.totalIncome.toFixed(2)} and spent $${summary.totalExpenses.toFixed(2)}.`);
  if (summary.topSpendingCategories[0]) {
    insights.push(
      `${summary.topSpendingCategories[0].category} is your biggest spending category at $${summary.topSpendingCategories[0].amount.toFixed(2)}.`
    );
  }
  if (summary.subscriptions.length > 0) {
    insights.push(`You have ${summary.subscriptions.length} subscription charges. Review any service you did not use this month.`);
  }
  if (summary.unusualSpending[0]) {
    insights.push(`A larger-than-usual expense was ${summary.unusualSpending[0].description} at $${summary.unusualSpending[0].amount.toFixed(2)}.`);
  }
  insights.push(summary.savings >= 0 ? `You saved about $${summary.savings.toFixed(2)} this period.` : `You are overspending by about $${Math.abs(summary.savings).toFixed(2)} this period.`);
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

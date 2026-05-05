import type { ParsedTransaction } from "@/lib/pdf";

type AiTransaction = {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: "Food" | "Rent" | "Shopping" | "Transport" | "Subscription" | "Income" | "Other";
};

export type AiStatementAnalysis = {
  transactions: ParsedTransaction[];
  summaryText: string;
};

const financeAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["transactions", "summary"],
  properties: {
    transactions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "description", "amount", "type", "category"],
        properties: {
          date: { type: "string", description: "Transaction date in YYYY-MM-DD format." },
          description: { type: "string" },
          amount: { type: "number", description: "Positive transaction amount." },
          type: { type: "string", enum: ["income", "expense"] },
          category: {
            type: "string",
            enum: ["Food", "Rent", "Shopping", "Transport", "Subscription", "Income", "Other"]
          }
        }
      }
    },
    summary: {
      type: "object",
      additionalProperties: false,
      required: ["biggestSpendingCategory", "totalMonthlySpending", "subscriptionCount", "savingOpportunities", "summaryText"],
      properties: {
        biggestSpendingCategory: {
          type: "string",
          enum: ["Food", "Rent", "Shopping", "Transport", "Subscription", "Income", "Other"]
        },
        totalMonthlySpending: { type: "number" },
        subscriptionCount: { type: "integer" },
        savingOpportunities: {
          type: "array",
          items: { type: "string" }
        },
        summaryText: { type: "string" }
      }
    }
  }
} as const;

export async function analyzeStatementWithAi(extractedText: string): Promise<AiStatementAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      max_output_tokens: 5000,
      input: [
        {
          role: "system",
          content:
            "You are Beveoy, a careful financial statement analyst. Extract real transactions from bank or card statement text. Return only transactions clearly present in the statement. Use positive amounts. Use expense unless the row is salary, payroll, deposit, refund, interest, or another clear inflow. Categorize with the allowed categories only."
        },
        {
          role: "user",
          content: `Analyze this electronic bank statement text and produce JSON that matches the schema.\n\n${extractedText.slice(
            0,
            60000
          )}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "beveoy_statement_analysis",
          strict: true,
          schema: financeAnalysisSchema
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI statement analysis failed:", errorText);
    return null;
  }

  const data = await response.json();
  const outputText = readOutputText(data);
  if (!outputText) return null;

  const parsed = JSON.parse(outputText) as {
    transactions: AiTransaction[];
    summary: { summaryText: string; savingOpportunities: string[] };
  };

  return {
    transactions: parsed.transactions
      .map((transaction) => ({
        date: new Date(transaction.date),
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        type: transaction.type,
        category: transaction.category
      }))
      .filter((transaction) => !Number.isNaN(transaction.date.getTime())),
    summaryText: buildSummaryText(parsed.summary.summaryText, parsed.summary.savingOpportunities)
  };
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

function buildSummaryText(summaryText: string, opportunities: string[]) {
  if (opportunities.length === 0) return summaryText;
  return `${summaryText} Saving opportunities: ${opportunities.join(" ")}`;
}

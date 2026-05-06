import { categorizeTransaction, inferTransactionType } from "@/lib/categorize";

export type ParsedTransaction = {
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: "Food" | "Rent" | "Shopping" | "Transport" | "Subscription" | "Income" | "Other";
};

export async function extractTextFromPdf(buffer: Buffer) {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text.trim();
}

export function parseTransactionsFromText(text: string): ParsedTransaction[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const transactions: ParsedTransaction[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const match = matchTransactionLine(line);

    if (!match) continue;

    const parsedDate = normalizeDate(match.date);
    const rawAmount = normalizeAmount(match.amount);
    const amount = Number.parseFloat(rawAmount);

    if (!parsedDate || Number.isNaN(amount)) continue;

    const description = cleanDescription(match.description);
    const category = categorizeTransaction(description);
    const type = inferTransactionType(description, amount);
    const normalizedAmount = Math.abs(amount);
    const signature = `${parsedDate.toISOString()}|${description}|${normalizedAmount.toFixed(2)}`;

    if (!description || seen.has(signature)) continue;
    seen.add(signature);

    transactions.push({
      date: parsedDate,
      description,
      amount: normalizedAmount,
      type,
      category
    });
  }

  return transactions;
}

function matchTransactionLine(line: string) {
  const patterns = [
    /^(?<date>\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+(?<description>.+?)\s+(?<amount>-?\$?\d[\d,]*(?:\.\d{2})?(?:\s?(?:cr|dr))?)$/i,
    /^(?<date>\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+(?<description>.+?)\s+(?<amount>\(\$?\d[\d,]*(?:\.\d{2})?\)|\$?\d[\d,]*(?:\.\d{2})?)$/i,
    /^(?<date>\d{4}-\d{2}-\d{2})\s+(?<description>.+?)\s+(?<amount>-?\$?\d[\d,]*(?:\.\d{2})?)$/i
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match?.groups?.date && match.groups.description && match.groups.amount) {
      return {
        date: match.groups.date,
        description: match.groups.description,
        amount: match.groups.amount
      };
    }
  }

  return null;
}

function normalizeAmount(value: string) {
  const compact = value.toLowerCase().replace(/\s+/g, "");
  const negative = compact.includes("dr") || compact.startsWith("(");
  const stripped = compact.replace(/[,$()]/g, "").replace(/cr|dr/g, "");
  return negative ? `-${stripped}` : stripped;
}

function cleanDescription(value: string) {
  return value.replace(/\s{2,}/g, " ").replace(/\b(?:pos|ach|dbt|visa|mc)\b/gi, "").trim();
}

function normalizeDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parts = value.split(/[/-]/).map(Number);
  if (parts.length < 2) return null;

  const month = parts[0];
  const day = parts[1];
  const currentYear = new Date().getFullYear();
  const year = parts[2] ? normalizeYear(parts[2]) : currentYear;
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function normalizeYear(year: number) {
  if (year < 100) return year + 2000;
  return year;
}

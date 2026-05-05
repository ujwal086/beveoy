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

  for (const line of lines) {
    const match = line.match(
      /(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+(.+?)\s+(-?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)$/
    );

    if (!match) continue;

    const parsedDate = normalizeDate(match[1]);
    const rawAmount = match[3].replace(/[$,]/g, "");
    const amount = Number.parseFloat(rawAmount);

    if (!parsedDate || Number.isNaN(amount)) continue;

    const description = match[2];
    const category = categorizeTransaction(description);
    const type = inferTransactionType(description, amount);
    const normalizedAmount = type === "expense" ? Math.abs(amount) : Math.abs(amount);

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

function normalizeDate(value: string) {
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

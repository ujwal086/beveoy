import { Sparkles } from "lucide-react";

export function AiSummaryCard({ summary }: { summary: string }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-saffron" />
        <h2 className="text-lg font-semibold text-ink">AI summary</h2>
      </div>
      <p className="text-sm leading-6 text-ink/70">{summary}</p>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export function AiInsightsPanel({ enabled }: { enabled: boolean }) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function loadInsights() {
      setLoading(true);
      const response = await fetch("/api/ai/insights", { method: "POST" });
      const result = (await response.json()) as { insights?: string[] };

      if (!cancelled) {
        setInsights(result.insights ?? []);
        setLoading(false);
      }
    }

    void loadInsights();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-saffron" />
        <h2 className="text-lg font-semibold text-ink">AI recommendations</h2>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your spending patterns...
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm leading-6 text-ink/60">Upload a statement to unlock tailored saving ideas.</p>
      ) : (
        <div className="space-y-2">
          {insights.map((insight) => (
            <p key={insight} className="text-sm leading-6 text-ink/70">
              {insight}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

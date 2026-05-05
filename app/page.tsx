import Link from "next/link";
import { ArrowRight, FileText, LineChart, Lock, Sparkles, Upload } from "lucide-react";
import { FeatureCard } from "@/components/landing/feature-card";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-mint">Beveoy</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-ink md:text-7xl">
              Upload your PDFs. Let AI help you save money.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              Upload statements, receipts, or bills. Our AI analyzes your spending, finds patterns, and gives personalized insights to help you save more every month.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
              >
                <Upload className="h-4 w-4" /> Upload PDF
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper p-5 shadow-soft">
            <div className="rounded-md bg-white p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink/60">May snapshot</p>
                  <p className="text-3xl font-semibold text-ink">$4,820</p>
                </div>
                <Sparkles className="h-7 w-7 text-saffron" />
              </div>
              <div className="space-y-3">
                {[
                  ["Income", "$6,400", "bg-mint"],
                  ["Expenses", "$4,820", "bg-coral"],
                  ["Savings", "$1,580", "bg-saffron"]
                ].map(([label, value, color]) => (
                  <div key={label} className="flex items-center justify-between rounded-md border border-ink/10 p-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${color}`} />
                      <span className="text-sm font-medium text-ink">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-ink">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Financial PDFs are useful, but hard to read.</h2>
          </div>
          <p className="text-lg leading-8 text-ink/70">
            Beveoy converts statement text into structured transactions and simple insights, so a beginner can spot spending patterns without building a spreadsheet.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={FileText} title="PDF extraction" description="Read bank statements, bills, receipts, and card statements with pdf-parse." />
          <FeatureCard icon={LineChart} title="Dashboard metrics" description="Track income, expenses, savings, categories, and monthly spending." />
          <FeatureCard icon={Sparkles} title="AI-ready summary" description="Mock insights today, structured for OpenAI-powered summaries later." />
          <FeatureCard icon={Lock} title="Private by default" description="Protected routes, user-scoped queries, and no public PDF exposure." />
        </div>
      </section>
    </main>
  );
}

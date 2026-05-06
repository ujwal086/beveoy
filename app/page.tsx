import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload
} from "lucide-react";

export const dynamic = "force-dynamic";

const trustSignals = [
  "We do not store bank login credentials",
  "Your PDFs stay private to your account",
  "Secure upload with user-scoped access",
  "AI analysis without selling your data"
];

const featureCards = [
  {
    title: "Money leaks, surfaced fast",
    description:
      "See spending by category, recurring subscriptions, unusual spikes, and simple savings moves without building a spreadsheet."
  },
  {
    title: "AI that speaks like a coach",
    description:
      "Turn raw statements into clear recommendations like where dining climbed, which subscriptions are inactive, and what to cut first."
  },
  {
    title: "A clean plan after every upload",
    description:
      "Upload a statement, review categorized transactions, and leave with a dashboard that feels like a money plan instead of a file dump."
  }
];

const testimonials = [
  {
    quote:
      "Beveoy showed me the subscriptions I forgot about and the weekends where I was overspending. It felt like getting my money story in plain English.",
    name: "Maya R.",
    role: "Early beta user"
  },
  {
    quote:
      "I uploaded one statement and finally saw where dining and impulse shopping were quietly eating my budget. The clarity was instant.",
    name: "Daniel K.",
    role: "Freelancer"
  },
  {
    quote:
      "It feels safer than sharing bank logins, and the savings suggestions are specific enough to act on the same day.",
    name: "Aisha P.",
    role: "Operations manager"
  }
];

const faqs = [
  {
    question: "Do I need to connect my bank account?",
    answer:
      "No. Beveoy works from the PDF statements you already have, so you never need to share bank login credentials."
  },
  {
    question: "What kind of files can I upload?",
    answer:
      "Upload PDF bank statements, card statements, receipts, and bills. Beveoy reads the statement, categorizes activity, and turns it into a money dashboard."
  },
  {
    question: "What do I get on the free plan?",
    answer:
      "You can upload up to 2 PDFs each month, review a basic dashboard, and see starter insights before deciding if Pro is worth it."
  },
  {
    question: "What makes Pro different?",
    answer:
      "Pro unlocks unlimited uploads, advanced AI insights, subscription detection, a financial coach, and deeper savings recommendations."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f4f8f7] text-ink">
      <header className="border-b border-ink/8 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="text-xl font-semibold text-ink">
            Beveoy
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-ink/70 transition hover:text-ink">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-ink/70 transition hover:text-ink">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-ink/70 transition hover:text-ink">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-ink/70 transition hover:text-ink">
              Dashboard
            </Link>
            <Link href="/sign-in" className="text-sm font-medium text-ink/70 transition hover:text-ink">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-ink/8 bg-white">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-mint/20 bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">
              <Sparkles className="h-4 w-4" />
              AI-powered statement analysis for real-world budgets
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-ink md:text-7xl">
              Stop guessing where your money goes. Beveoy finds money leaks from your statements in seconds.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/68">
              Upload a bank statement PDF and turn it into a clear spending story. Beveoy categorizes expenses, detects
              subscriptions, highlights spikes, and gives you a practical savings plan without spreadsheets.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Upload Your First Statement <Upload className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
              >
                Try Beveoy Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {trustSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-3 rounded-md border border-ink/8 bg-[#f6fbfa] px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-mint" />
                  <p className="text-sm text-ink/72">{signal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-ink/8 bg-[#eef8f6] p-5 shadow-soft">
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink/55">Statement preview</p>
                  <h2 className="mt-1 text-2xl font-semibold text-ink">Your money, translated into a plan</h2>
                </div>
                <div className="rounded-md bg-[#eef8ff] p-2 text-[#1d6dd9]">
                  <Bot className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Food spending", "$420", "text-coral"],
                  ["Subscriptions detected", "6", "text-[#1d6dd9]"],
                  ["Possible monthly savings", "$180", "text-mint"],
                  ["Biggest category", "Dining", "text-saffron"]
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-md border border-ink/8 bg-[#fbfcfc] p-4">
                    <p className="text-sm text-ink/55">{label}</p>
                    <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-ink/8 bg-[#f8fafb] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">AI recommendations</p>
                    <p className="text-sm text-ink/55">Three quick ways to reduce next month’s spend</p>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-mint" />
                </div>
                <div className="space-y-3">
                  {[
                    "Dining ran 28% higher this month than your recent average.",
                    "Unused subscriptions could save about $45 each month.",
                    "Cutting dining and shopping by 15% could free up $180."
                  ].map((insight) => (
                    <div key={insight} className="flex gap-3 rounded-md border border-ink/8 bg-white px-3 py-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-mint" />
                      <p className="text-sm leading-6 text-ink/72">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-md border border-ink/8 bg-[#fbfcff] p-4">
                  <p className="text-sm font-medium text-ink">Monthly trend</p>
                  <div className="mt-5 flex h-32 items-end gap-3">
                    {[52, 68, 49, 72, 58, 80].map((height, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={`w-full rounded-t-md ${index === 5 ? "bg-coral" : "bg-mint/80"}`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-ink/50">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-ink/8 bg-[#fffdfa] p-4">
                  <p className="text-sm font-medium text-ink">Top expenses</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Restaurant group", "$148"],
                      ["Amazon orders", "$121"],
                      ["Groceries", "$96"],
                      ["Streaming bundle", "$42"]
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                        <span className="text-sm text-ink/72">{label}</span>
                        <span className="text-sm font-semibold text-ink">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/8 bg-[#f6fbfa] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">Security and privacy</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
              A finance product should feel safe before it ever asks for a file.
            </h2>
            <p className="mt-4 text-lg leading-8 text-ink/68">
              Beveoy is built for people who want clarity without sharing bank logins. Upload the statements you already
              have, keep your files private, and get AI analysis focused on your money choices instead of your credentials.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "No bank logins required",
                description:
                  "You upload your statement PDF directly. Beveoy never asks for your bank username or password."
              },
              {
                icon: Lock,
                title: "Private PDFs",
                description: "Files and extracted transactions are scoped to the signed-in user and never exposed as public links."
              },
              {
                icon: Upload,
                title: "Secure upload flow",
                description: "Uploads are validated, size-limited, and processed with account-level protections."
              },
              {
                icon: Sparkles,
                title: "No data resale",
                description: "AI analysis is used to give you better insights, not to package and sell your financial behavior."
              }
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-ink/8 bg-white p-5 shadow-sm">
                <div className="inline-flex rounded-md bg-mint/10 p-2 text-mint">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/66">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">Why people use it</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
                Save more without spreadsheets, formulas, or endless statement scrolling.
              </h2>
              <p className="mt-4 text-lg leading-8 text-ink/68">
                Beveoy turns a plain statement into a smart money plan with category breakdowns, subscription detection,
                trend tracking, and an AI coach that points to practical next steps.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => (
                <div key={card.title} className="rounded-lg border border-ink/8 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink/66">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/8 bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
              Upload once. Understand faster. Save with confidence.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload statement",
                description:
                  "Drag in a bank statement PDF, receipt, or bill. No bank connection and no spreadsheets required."
              },
              {
                step: "2",
                title: "AI analyzes spending",
                description:
                  "Beveoy categorizes spending, detects recurring subscriptions, and highlights where costs are climbing."
              },
              {
                step: "3",
                title: "Get your saving plan",
                description:
                  "Review your dashboard, top expenses, monthly trends, and the easiest places to free up cash."
              }
            ].map((item) => (
              <div key={item.step} className="rounded-lg border border-ink/8 bg-[#f8fafb] p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-semibold text-white">
                  {item.step}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/66">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">Loved by early users</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
                People trust clarity when the money story finally makes sense.
              </h2>
            </div>
            <Link href="/sign-up" className="text-sm font-semibold text-mint hover:text-mint/85">
              Try it free
            </Link>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-lg border border-ink/8 bg-white p-6 shadow-sm">
                <p className="text-sm leading-7 text-ink/72">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="font-semibold text-ink">{testimonial.name}</p>
                  <p className="text-sm text-ink/55">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/8 bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
                Everything people ask before they trust a finance upload.
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-lg border border-ink/8 bg-[#f8fafb] p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-ink">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/66">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-lg border border-ink/8 bg-ink px-8 py-14 text-white shadow-soft">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">Final CTA</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight">
                Turn your next statement into a smart money plan.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
                Upload a statement, find where your money is going, and get a savings plan that feels personal in minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-md bg-mint px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint/90"
              >
                Upload Your First Statement
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Try Beveoy Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

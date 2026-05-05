# Beveoy

Beveoy is a first MVP for uploading financial PDFs, extracting text, creating starter transaction records, categorizing spending, and showing a clean finance dashboard.

## Folder Structure

```txt
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (dashboard)/
    coach/page.tsx
    dashboard/page.tsx
    savings/page.tsx
    transactions/page.tsx
    upload/page.tsx
    layout.tsx
  billing/
    success/page.tsx
  api/
    ai/coach/route.ts
    ai/insights/route.ts
    billing/create-checkout-session/route.ts
    billing/webhook/route.ts
    budgets/route.ts
    transactions/route.ts
    transactions/[id]/route.ts
    transactions/export/route.ts
    upload/route.ts
    upload/[id]/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  dashboard/
    ai-summary-card.tsx
    ai-insights-panel.tsx
    category-chart.tsx
    monthly-chart.tsx
    recent-transactions.tsx
    stat-card.tsx
  billing/
    billing-status.tsx
    pricing-cards.tsx
  coach/
    coach-chat.tsx
  savings/
    budget-form.tsx
    budget-list.tsx
    opportunity-list.tsx
  landing/
    feature-card.tsx
  upload/
    upload-form.tsx
    uploaded-files.tsx
  transactions/
    manual-transaction-form.tsx
    transactions-table.tsx
lib/
  ai-summary.ts
  categorize.ts
  finance-summary.ts
  openai-finance.ts
  pdf.ts
  plans.ts
  prisma.ts
  stripe.ts
  user.ts
  utils.ts
prisma/
  schema.prisma
types/
  dashboard.ts
middleware.ts
```

## Features

- Public landing page with hero, problem/solution, features, and CTA links.
- Clerk authentication with protected dashboard, upload page, and upload API routes.
- PDF upload validation for `application/pdf`.
- PDF text extraction with `pdf-parse`.
- OpenAI-powered bank statement analysis when `OPENAI_API_KEY` is configured.
- Premium-only AI insights endpoint and dashboard panel.
- Premium-only AI coach chat for budgeting questions.
- Rule-based transaction parsing and categorization fallback when AI is not configured.
- Stripe billing with monthly and yearly Pro checkout flows.
- Prisma models for `User`, `UploadedFile`, `Transaction`, and `MonthlyReport`.
- User-scoped dashboard totals, chart, recent transactions, and mock AI summary.
- Manual transaction entry for corrections and cash transactions.
- Searchable and filterable transaction history.
- Category spending breakdown chart.
- CSV export for all user transactions.
- Savings Coach page with monthly budgets and money-saving recommendations.
- Budget tracking with over-budget and watch states.
- Subscription audit and category-based savings suggestions.
- Pricing page with billing status, free trial messaging, and Pro upgrade flow.
- Private uploaded data model: the app stores extracted text and metadata, not public PDF URLs.
- User-owned uploaded file deletion.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beveoy?schema=public"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_replace_me"
CLERK_SECRET_KEY="sk_test_replace_me"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_MONTHLY_PRICE_ID=""
STRIPE_YEARLY_PRICE_ID=""
PROMO_CODE=""
CLIENT_URL="http://localhost:3000"
```

4. Run the Prisma migration against your Postgres database:

```bash
npx prisma migrate dev --name init_postgres
```

Clerk keys must be real values from the Clerk dashboard. `DATABASE_URL` must point at a real Postgres instance before the app can load data at runtime.

5. Start the app:

```bash
npm run dev
```

6. Open the port printed by `npm run dev`.

For hosted deploys, set the same environment variables in your deployment platform instead of relying on local files.
For a full Vercel deployment checklist, see [DEPLOYMENT.md](/home/ujwal/finance app/DEPLOYMENT.md).

## PDF Parsing Notes

The MVP parser expects statement lines shaped roughly like:

```txt
05/01/2026 Starbucks 7.45
05/02/2026 Payroll Deposit 2400.00
05/03/2026 Netflix 15.99
```

Financial PDFs vary heavily by bank and issuer. The current parsing code in `lib/pdf.ts` is deliberately small and beginner-friendly so it can be extended with bank-specific parsers later.

## Categorization Rules

Rules live in `lib/categorize.ts`:

- Walmart, Target, Amazon -> Shopping
- McDonald's, Starbucks, Chipotle, restaurant -> Food
- Uber, Lyft, gas, metro -> Transport
- Netflix, Spotify, YouTube, Apple -> Subscription
- salary, payroll, deposit -> Income
- everything else -> Other

## AI Summary

`lib/openai-finance.ts` uses the OpenAI Responses API with Structured Outputs to extract transactions and summarize statement insights from uploaded PDF text when `OPENAI_API_KEY` is set. If the key is empty or the API call fails, Beveoy falls back to the local rule parser in `lib/pdf.ts` and the local summary in `lib/ai-summary.ts`.

AI-generated summaries are stored on `UploadedFile.aiSummary`, and the dashboard shows the latest available AI summary.

## Billing Setup

Beveoy keeps the existing Clerk authentication flow and stores billing state in the Prisma `User` model.

Set these Stripe variables:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`
- `CLIENT_URL`

Create Stripe products and prices for:

- `$15/month`
- `$90/year`

Webhook events to enable:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Local Stripe testing:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Then copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Checkout testing:

1. Open `/pricing`
2. Start the monthly or yearly trial
3. Use Stripe test card `4242 4242 4242 4242`
4. Return to `/pricing` and confirm the plan and subscription status update

Promo code testing:

1. Set `PROMO_CODE` in your environment
2. Open `/pricing`
3. Enter the promo code in the promo section
4. The signed-in account will be upgraded to Pro

## Production Postgres

Recommended providers:

- Neon
- Supabase
- Railway
- Render
- AWS RDS

Production rollout:

1. Create a hosted Postgres database.
2. Set the production `DATABASE_URL` in your deployment platform.
3. Run:

```bash
npx prisma migrate deploy
```

4. Deploy the app with the same migration files checked into git.

This repo is now configured for Prisma migrations against Postgres instead of local SQLite.

## Runtime guardrails

- Upload API enforces a 10 MB PDF size limit.
- Uploads are rate-limited per signed-in user.
- AI insights and AI coach requests are rate-limited per premium user.
- Stripe checkout session creation is rate-limited per signed-in user.
- Uploaded file content remains private to the owning account.

## Savings Coach

Beveoy includes a `/savings` page for practical money management:

- Set monthly category budgets.
- See which categories are healthy, near the limit, or over budget.
- Get simple saving opportunities based on subscriptions, shopping, and overspending patterns.
- Use the dashboard coach card as a shortcut into the savings workspace.

## Security Model

- Dashboard pages call `getCurrentAppUser()` before reading user data.
- API routes return `401` for signed-out users.
- Premium AI routes return `403` for free users with an upgrade message.
- Queries include `userId` filters so users only access their own files and transactions.
- Uploaded PDFs are not saved to a public directory.
- Deleting an uploaded file first verifies ownership.

## Production Next Steps

- Move uploaded PDFs and extracted artifacts to private object storage like S3 or R2 if you need persistent file reprocessing.
- Add bank-specific parsing adapters and tests with anonymized sample statements.
- Add background jobs for large PDFs.
- Add Redis-backed rate limiting for multi-instance deployments instead of the current in-memory limiter.
- Replace the mock summary with an OpenAI call guarded by spending limits and prompt logging controls.
- Add richer duplicate detection for repeated statement uploads.

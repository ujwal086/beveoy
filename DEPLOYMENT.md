# Beveoy Deployment Guide

This project is ready to deploy on Vercel with Supabase Postgres, Clerk, and Stripe.

## 1. Push the repo

Push the project to GitHub.

## 2. Create a Vercel project

1. Open Vercel
2. Import the GitHub repository
3. Keep the framework preset as `Next.js`

## 3. Set environment variables in Vercel

Add these variables to the Vercel project:

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=
CLIENT_URL=
```

Important for `DATABASE_URL`:

- Do not use `localhost`
- Do not use `file:./dev.db`
- If you use Supabase with Vercel, use the **Session Pooler** connection string
- The direct host like `db.<project-ref>.supabase.co:5432` may fail from Vercel

Example Supabase pooler format:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Use your production Vercel domain or custom domain for `CLIENT_URL`, for example:

```env
CLIENT_URL=https://beveoy.com
```

## 4. Build behavior

This repo includes:

```json
{
  "buildCommand": "npm run db:deploy && npm run build"
}
```

That means Vercel will:

1. apply Prisma migrations to Postgres
2. build the Next.js app

## 5. Stripe webhook

In Stripe, create a webhook endpoint:

```txt
https://your-domain.com/api/billing/webhook
```

Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copy the webhook signing secret into:

```env
STRIPE_WEBHOOK_SECRET=
```

## 6. Clerk production setup

In Clerk:

1. add your production domain
2. confirm redirect URLs match your deployed domain

## 7. Smoke test after deploy

1. Sign up
2. Upload a PDF under the free plan
3. Confirm transactions appear
4. Delete the upload and confirm the dashboard clears
5. Open pricing
6. Start a Stripe checkout
7. Confirm billing status updates
8. Test AI summary / AI insights behavior

## 8. Strongly recommended next steps

- rotate any secrets that were pasted in chat
- move file artifacts to private object storage if you want reprocessing
- replace in-memory rate limiting with Redis or Upstash for multi-instance production
- add monitoring such as Sentry

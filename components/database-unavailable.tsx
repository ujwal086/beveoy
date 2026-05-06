import { Database } from "lucide-react";

export function DatabaseUnavailable() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-12 lg:px-8">
      <section className="rounded-lg border border-coral/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-coral/10 text-coral">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">Database connection unavailable</h1>
            <p className="text-sm text-ink/60">Beveoy could not reach your database, so dashboard data cannot load right now.</p>
          </div>
        </div>
        <div className="space-y-3 text-sm leading-6 text-ink/70">
          <p>Check your `DATABASE_URL`, make sure the database is reachable, then refresh this page.</p>
          <pre className="overflow-x-auto rounded-md bg-ink p-4 text-xs text-white">
{`# local Postgres
docker compose up -d

# or hosted Postgres / Supabase
# use a reachable DATABASE_URL, then run:
npx prisma migrate deploy
npm run dev`}
          </pre>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Lock } from "lucide-react";

export function PremiumLock({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Lock className="h-4 w-4 text-coral" />
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      </div>
      <p className="text-sm leading-6 text-ink/65">{detail}</p>
      <Link href="/pricing" className="mt-4 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90">
        Upgrade to Pro
      </Link>
    </section>
  );
}

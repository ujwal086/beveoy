import { isPremiumStatus } from "@/lib/plans";
import { getCurrentAppUser } from "@/lib/user";
import { PremiumLock } from "@/components/premium-lock";
import { CoachChat } from "@/components/coach/coach-chat";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const user = await getCurrentAppUser();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">AI Coach</h1>
        <p className="mt-2 text-sm text-ink/60">Ask practical questions about spending, saving, and upcoming purchases.</p>
      </div>
      {isPremiumStatus(user.subscriptionStatus) ? (
        <CoachChat />
      ) : (
        <PremiumLock title="AI Coach is part of Pro" detail="Upgrade to ask personalized money questions using your transaction history." />
      )}
    </main>
  );
}

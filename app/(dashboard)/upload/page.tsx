import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/user";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadedFiles } from "@/components/upload/uploaded-files";
import { isDatabaseConnectionError } from "@/lib/db-errors";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { isPremiumStatus } from "@/lib/plans";

export const dynamic = "force-dynamic";

type UploadedFileWithCount = Awaited<
  ReturnType<
    typeof prisma.uploadedFile.findMany<{
      include: {
        _count: {
          select: { transactions: true };
        };
      };
    }>
  >
>[number];

export default async function UploadPage() {
  let files: UploadedFileWithCount[];
  let plan = "free";
  let subscriptionStatus = "inactive";
  let uploadsUsed = 0;
  let uploadLimit = 3;

  try {
    const user = await getCurrentAppUser();
    plan = user.plan;
    subscriptionStatus = user.subscriptionStatus;
    uploadsUsed = user.uploadsUsed;
    uploadLimit = user.uploadLimit;
    files = await prisma.uploadedFile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable />;
    }

    throw error;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold text-ink">Upload a statement</h1>
        <p className="mt-2 text-base leading-7 text-ink/65">
          Turn a bank or card statement into a dashboard with categorized spending, recurring subscriptions, and AI-powered savings suggestions.
        </p>
        <p className="mt-3 text-sm text-ink/60">
          {isPremiumStatus(subscriptionStatus)
            ? `Your ${plan} plan includes unlimited uploads and AI analysis.`
            : `${uploadsUsed}/${uploadLimit} uploads used this month on the free plan.`}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <UploadForm />
          <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">What happens next</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Upload PDF", "Drop in a statement PDF and keep bank credentials out of the workflow."],
                ["AI reads spending", "Beveoy categorizes purchases, flags recurring charges, and spots spending spikes."],
                ["Review your plan", "Open the dashboard to see income, spending, savings opportunities, and trends."]
              ].map(([title, description]) => (
                <div key={title} className="rounded-md border border-ink/8 bg-[#f8fafb] p-4">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Uploaded files</h2>
            <span className="text-sm text-ink/55">Private to your account</span>
          </div>
          <UploadedFiles
            files={files.map((file) => ({
              id: file.id,
              fileName: file.fileName,
              size: file.size,
              createdAt: file.createdAt.toISOString(),
              transactionCount: file._count.transactions
            }))}
          />
        </section>
      </div>
    </main>
  );
}

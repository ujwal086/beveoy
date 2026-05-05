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
    <main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Upload PDF</h1>
        <p className="mt-2 text-sm text-ink/60">Beveoy extracts text, applies starter parsing rules, and stores transactions under your account.</p>
        <p className="mt-3 text-sm text-ink/60">
          {isPremiumStatus(subscriptionStatus)
            ? `Your ${plan} plan includes unlimited uploads and AI analysis.`
            : `${uploadsUsed}/${uploadLimit} uploads used this month on the free plan.`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <UploadForm />
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink">Uploaded files</h2>
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

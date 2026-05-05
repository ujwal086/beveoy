import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FREE_UPLOAD_LIMIT } from "@/lib/plans";

export type AppUser = Awaited<ReturnType<typeof prisma.user.upsert>>;

export async function getCurrentAppUser(): Promise<AppUser> {
  const user = await getCurrentAppUserOrNull();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function getCurrentAppUserOrNull(): Promise<AppUser | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name =
    clerkUser.fullName ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ??
    null;

  return prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    update: { email, name },
    create: {
      clerkUserId: clerkUser.id,
      email,
      name,
      plan: "free",
      subscriptionStatus: "inactive",
      uploadsUsed: 0,
      uploadLimit: FREE_UPLOAD_LIMIT
    }
  });
}

export const FREE_UPLOAD_LIMIT = 3;

export type AppPlan = "free" | "pro_monthly" | "pro_yearly";
export type SubscriptionStatus = "inactive" | "trialing" | "active" | "canceled" | "past_due";

export function isPremiumStatus(status: string | null | undefined) {
  return status === "trialing" || status === "active";
}

export function resolveUploadLimit(plan: string, status: string) {
  return isPremiumStatus(status) && plan !== "free" ? 999999 : FREE_UPLOAD_LIMIT;
}

export function normalizePlanForStripe(interval: "monthly" | "yearly"): AppPlan {
  return interval === "monthly" ? "pro_monthly" : "pro_yearly";
}

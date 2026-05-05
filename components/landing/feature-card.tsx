import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-ink/10 bg-paper p-5">
      <Icon className="mb-5 h-6 w-6 text-mint" />
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
    </article>
  );
}

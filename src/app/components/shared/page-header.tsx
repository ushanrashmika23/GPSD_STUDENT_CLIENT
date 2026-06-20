import type { ReactNode } from "react";
import { FadeIn } from "./motion";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <FadeIn>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-[1.6rem] leading-tight tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[0.95rem] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </FadeIn>
  );
}

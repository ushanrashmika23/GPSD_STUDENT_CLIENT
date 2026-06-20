import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../ui/utils";
import { cardSurface } from "./surface";
import { StaggerItem } from "./motion";
import { tones, type Tone } from "../../lib/accents";

export interface StatTrend {
  value: string;
  positive: boolean;
}

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  trend,
  hint,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  trend?: StatTrend;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <StaggerItem className={cn(cardSurface, "p-5")}>
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            tones[tone].soft,
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs",
              trend.positive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
        <span className="text-[1.75rem] leading-none tracking-tight text-foreground">
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        )}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </StaggerItem>
  );
}

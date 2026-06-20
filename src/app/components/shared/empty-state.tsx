import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cardSurface } from "./surface";
import { cn } from "../ui/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        cardSurface,
        "flex flex-col items-center justify-center px-6 py-16 text-center",
      )}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex size-16 items-center justify-center rounded-2xl bg-accent text-primary"
      >
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/5" />
        <Icon className="size-7" strokeWidth={1.8} />
      </motion.div>
      <h3 className="mt-5 tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

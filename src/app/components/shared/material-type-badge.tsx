import { FileText, PlayCircle } from "lucide-react";
import { cn } from "../ui/utils";
import type { MaterialType } from "../../lib/types";

export function MaterialTypeBadge({ type }: { type: MaterialType }) {
  const isPdf = type === "PDF";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
        isPdf
          ? "bg-accent text-accent-foreground"
          : "bg-success/10 text-success",
      )}
    >
      {isPdf ? (
        <FileText className="size-3.5" />
      ) : (
        <PlayCircle className="size-3.5" />
      )}
      {type}
    </span>
  );
}

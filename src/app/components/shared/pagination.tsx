import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../ui/utils";

function pageList(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(count - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < count - 1) out.push("…");
  out.push(count);
  return out;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  from,
  to,
  total,
  label = "items",
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
  from: number;
  to: number;
  total: number;
  label?: string;
}) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-mono tabular-nums text-foreground">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-mono tabular-nums text-foreground">{total}</span>{" "}
        {label}
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <PagerButton
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </PagerButton>

          {pageList(page, pageCount).map((p, i) =>
            p === "…" ? (
              <span
                key={`gap-${i}`}
                className="px-1.5 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl font-mono text-sm tabular-nums transition-colors",
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {p}
              </button>
            ),
          )}

          <PagerButton
            disabled={page === pageCount}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </PagerButton>
        </div>
      )}
    </div>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
  ...rest
}: React.ComponentProps<"button">) {
  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

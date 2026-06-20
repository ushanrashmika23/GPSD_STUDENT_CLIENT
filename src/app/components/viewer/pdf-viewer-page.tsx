import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minus,
  Plus,
  Printer,
} from "lucide-react";
import { Button } from "../ui/button";
import { cardSurface } from "../shared/surface";
import { cn } from "../ui/utils";
import { toneFor } from "../../lib/accents";
import { formatLong, lessonName } from "../../lib/mock-data";
import type { Material } from "../../lib/types";

export function PdfViewerPage({
  material,
  onBack,
}: {
  material: Material;
  onBack: () => void;
}) {
  const total = material.pages ?? 10;
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const tone = toneFor(material.lesson_id);

  const go = (n: number) => setPage(Math.min(total, Math.max(1, n)));

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.4rem] leading-tight tracking-tight">
            {material.material_name}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("rounded-md px-2 py-0.5 text-xs", tone.soft)}>
              {lessonName(material.lesson_id)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <CalendarDays className="size-3.5" />
              {formatLong(material.date_added)}
            </span>
          </p>
        </div>
        <Button className="rounded-xl">
          <Download className="size-4" />
          Download
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Document viewport */}
        <div className={cn(cardSurface, "overflow-hidden")}>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
            <div className="flex items-center gap-1">
              <ToolBtn onClick={() => go(page - 1)} disabled={page === 1} label="Previous page">
                <ChevronLeft className="size-4" />
              </ToolBtn>
              <span className="px-2 font-mono text-sm tabular-nums">
                {page}{" "}
                <span className="text-muted-foreground">/ {total}</span>
              </span>
              <ToolBtn onClick={() => go(page + 1)} disabled={page === total} label="Next page">
                <ChevronRight className="size-4" />
              </ToolBtn>
            </div>
            <div className="flex items-center gap-1">
              <ToolBtn
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.15))}
                disabled={zoom <= 0.75}
                label="Zoom out"
              >
                <Minus className="size-4" />
              </ToolBtn>
              <span className="w-12 text-center font-mono text-xs tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <ToolBtn
                onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                disabled={zoom >= 1.6}
                label="Zoom in"
              >
                <Plus className="size-4" />
              </ToolBtn>
              <span className="mx-1 h-5 w-px bg-border" />
              <ToolBtn label="Print">
                <Printer className="size-4" />
              </ToolBtn>
              <ToolBtn label="Fullscreen">
                <Maximize2 className="size-4" />
              </ToolBtn>
            </div>
          </div>

          {/* Page canvas */}
          <div className="flex justify-center overflow-auto bg-slate-100/70 p-5 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: 560 * zoom }}
                className="origin-top"
              >
                <PdfPage material={material} page={page} total={total} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Info / thumbnails */}
        <aside className="space-y-4">
          <div className={cn(cardSurface, "p-5")}>
            <div className="flex items-center gap-2.5">
              <div className={cn("flex size-9 items-center justify-center rounded-xl", tone.soft)}>
                <FileText className="size-[18px]" />
              </div>
              <div>
                <p className="text-sm tracking-tight">Document details</p>
                <p className="text-xs text-muted-foreground">PDF · {total} pages</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {material.description}
            </p>
          </div>

          <div className={cn(cardSurface, "p-5")}>
            <p className="mb-3 text-sm tracking-tight">Pages</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: total }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => go(n)}
                    className={cn(
                      "flex aspect-[3/4] flex-col items-center justify-center rounded-lg border text-xs transition-colors",
                      n === page
                        ? "border-primary bg-accent text-primary ring-1 ring-primary/20"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    <FileText className="size-4 opacity-50" />
                    <span className="mt-1 font-mono">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// A stylised, readable mock PDF page (we cannot embed a real binary here).
function PdfPage({
  material,
  page,
  total,
}: {
  material: Material;
  page: number;
  total: number;
}) {
  return (
    <div className="aspect-[1/1.414] w-full rounded-sm bg-white px-8 py-10 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.25)]">
      {page === 1 ? (
        <div className="flex h-full flex-col">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-slate-400">
            AxiomMaths · {lessonName(material.lesson_id)}
          </p>
          <h2 className="mt-6 font-display text-2xl leading-tight tracking-tight text-slate-900">
            {material.material_name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {material.description}
          </p>
          <div className="mt-8 space-y-3">
            {["Key Concepts", "Worked Examples", "Practice Problems"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-md bg-indigo-50 font-mono text-xs text-indigo-600">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{s}</span>
                <span className="ml-auto font-mono text-xs text-slate-300">
                  p.{i + 2}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto space-y-2">
            {[10, 9, 11].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-slate-100"
                style={{ width: `${w * 9}%` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <p className="font-mono text-[0.65rem] text-slate-400">
            {material.material_name}
          </p>
          <div className="mt-5 space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 rounded-full bg-slate-100"
                style={{ width: `${85 - ((i * 7 + page * 3) % 30)}%` }}
              />
            ))}
          </div>
          <div className="my-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center font-mono text-sm text-slate-500">
            f(x) = ∫ g(x) dx&nbsp;&nbsp;·&nbsp;&nbsp;example {page - 1}
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 rounded-full bg-slate-100"
                style={{ width: `${92 - ((i * 9 + page * 5) % 38)}%` }}
              />
            ))}
          </div>
          <p className="mt-auto text-center font-mono text-xs text-slate-300">
            — {page} / {total} —
          </p>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  FolderOpen,
  PlayCircle,
  Search,
  SearchX,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { MaterialCardSkeleton } from "../shared/skeletons";
import { MaterialTypeBadge } from "../shared/material-type-badge";
import { EmptyState } from "../shared/empty-state";
import { Stagger, StaggerItem } from "../shared/motion";
import { Pagination } from "../shared/pagination";
import { interactiveCard } from "../shared/surface";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";
import { useLoading } from "../../lib/use-loading";
import { usePagination } from "../../lib/use-pagination";
import { toneFor } from "../../lib/accents";
import { formatLong, lessonName, lessons, materials } from "../../lib/mock-data";
import type { Material, MaterialType } from "../../lib/types";

type TypeFilter = "all" | MaterialType;
const PAGE_SIZE = 6;

export function MaterialsPage({
  onOpen,
}: {
  onOpen: (m: Material) => void;
}) {
  const loading = useLoading();
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [type, setType] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery =
        !q ||
        m.material_name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        lessonName(m.lesson_id).toLowerCase().includes(q);
      const matchesLesson = lesson === "all" || m.lesson_id === lesson;
      const matchesType = type === "all" || m.type === type;
      return matchesQuery && matchesLesson && matchesType;
    });
  }, [query, lesson, type]);

  const { page, setPage, pageCount, pageItems, from, to, total } = usePagination(
    filtered,
    PAGE_SIZE,
    [query, lesson, type],
  );

  const reset = () => {
    setQuery("");
    setLesson("all");
    setType("all");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Materials"
        subtitle="Lecture notes, worked papers and class recordings — all in one place."
      />

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search materials, lessons or topics…"
            className="h-11 rounded-xl pl-11"
          />
        </div>
        <Select value={lesson} onValueChange={setLesson}>
          <SelectTrigger className="h-11 rounded-xl sm:w-56">
            <SelectValue placeholder="All lessons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All lessons</SelectItem>
            {lessons.map((l) => (
              <SelectItem key={l.lesson_id} value={l.lesson_id}>
                {l.lesson_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type segmented filter */}
      <div className="flex items-center gap-2">
        {(["all", "PDF", "Recording"] as TypeFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              type === t
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "all" ? "All" : t === "PDF" ? "PDFs" : "Recordings"}
          </button>
        ))}
        {!loading && (
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MaterialCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={query || lesson !== "all" || type !== "all" ? SearchX : FolderOpen}
          title="No materials found"
          description="Nothing matches your current filters. Try a different search term or clear the filters to see everything."
          action={
            <Button variant="outline" className="rounded-xl" onClick={reset}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((m) => {
              const tone = toneFor(m.lesson_id);
              return (
                <StaggerItem key={m.material_id}>
                  <article
                    className={cn(interactiveCard, "flex h-full flex-col p-5")}
                  >
                    <div className="flex items-center justify-between">
                      <MaterialTypeBadge type={m.type} />
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatLong(m.date_added)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-[1.0rem] leading-snug tracking-tight">
                      {m.material_name}
                    </h3>
                    <span
                      className={cn(
                        "mt-1.5 w-fit rounded-md px-2 py-0.5 text-xs",
                        tone.soft,
                      )}
                    >
                      {lessonName(m.lesson_id)}
                    </span>
                    <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {m.description}
                    </p>

                    <Button
                      onClick={() => onOpen(m)}
                      className="mt-5 w-full rounded-xl"
                      variant={m.type === "PDF" ? "default" : "outline"}
                    >
                      {m.type === "PDF" ? (
                        <>
                          <FileText className="size-4" />
                          View PDF
                        </>
                      ) : (
                        <>
                          <PlayCircle className="size-4" />
                          Watch Recording
                        </>
                      )}
                    </Button>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={setPage}
            from={from}
            to={to}
            total={total}
            label="materials"
          />
        </div>
      )}
    </div>
  );
}

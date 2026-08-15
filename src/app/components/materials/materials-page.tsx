import { useEffect, useMemo, useState } from "react";
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
import { usePagination } from "../../lib/use-pagination";
import { toneFor } from "../../lib/accents";
import { getStudentMaterials, type StudentMaterial } from "../../lib/api";
import type { Material, MaterialType } from "../../lib/types";

type TypeFilter = "all" | MaterialType;
const PAGE_SIZE = 6;

// A fetched material plus its real lesson title (used for search/filters)
export type MaterialRow = Material & { lesson_title: string };

export function MaterialsPage({
  onOpen,
}: {
  onOpen: (m: Material) => void;
}) {
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [query, setQuery] = useState("");
  const [lesson, setLesson] = useState("all");
  const [type, setType] = useState<TypeFilter>("all");

  // GET /api/materials/student/:userId (userId from the stored login user).
  // The backend returns only non-expired materials for the student's batch,
  // newest first — the order is kept as-is for display.
  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const data = await getStudentMaterials();
      setRows(data.materials.map(toMaterial));
    } catch (error: any) {
      console.error("Materials load failed:", error);
      setLoadErr(
        error?.response?.data?.msg ??
          error?.message ??
          "Could not load your materials."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Lesson filter options come from the materials themselves
  const lessonOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => {
      if (!map.has(r.lesson_id)) map.set(r.lesson_id, r.lesson_title);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((m) => {
      const matchesQuery =
        !q ||
        m.material_name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.lesson_title.toLowerCase().includes(q);
      const matchesLesson = lesson === "all" || m.lesson_id === lesson;
      const matchesType = type === "all" || m.type === type;
      return matchesQuery && matchesLesson && matchesType;
    });
  }, [rows, query, lesson, type]);

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

  const hasActiveFilters = query.trim() !== "" || lesson !== "all" || type !== "all";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Materials"
        subtitle="Lecture notes, worked papers and class recordings — all in one place."
      />

      {loadErr && (
        <div
          className={cn(
            interactiveCard,
            "flex flex-col items-center gap-4 p-16 text-center",
          )}
        >
          <p className="text-sm text-destructive">{loadErr}</p>
          <Button variant="outline" onClick={load} className="rounded-xl">
            Try again
          </Button>
        </div>
      )}

      {/* Search + filters */}
      {!loadErr && (
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
              {lessonOptions.map(([id, title]) => (
                <SelectItem key={id} value={id}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Type segmented filter */}
      {!loadErr && (
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
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MaterialCardSkeleton key={i} />
          ))}
        </div>
      ) : !loadErr && filtered.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? SearchX : FolderOpen}
          title={hasActiveFilters ? "No materials found" : "No materials yet"}
          description={
            hasActiveFilters
              ? "Nothing matches your current filters. Try a different search term or clear the filters to see everything."
              : "The institute hasn't shared any materials with your class yet. Check back later."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" className="rounded-xl" onClick={reset}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : !loadErr ? (
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
                      {m.lesson_title}
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
      ) : null}
    </div>
  );
}

// e.g. 2026-03-12T00:00:00.000Z → "12 Mar 2026"
const formatLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Default thumbnail handed to recordings before the player opens
// (the DB stores no poster image for videos).
const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1561089489-f13d5e730d72?w=1200&h=675&fit=crop&auto=format";

// Map a backend material row to the UI Material shape. Shared by this page and
// the dashboard's recent-materials feed; recordings get the default poster
// BEFORE the player opens.
export const toMaterial = (m: StudentMaterial): MaterialRow => ({
  material_id: m.material_id,
  material_name: m.material_name,
  lesson_id: m.lesson_id,
  lesson_title: m.lesson_title,
  source_url: m.material_url,
  date_added: m.date_added,
  description: m.description,
  type: m.type === "DOCUMENT" ? "PDF" : "Recording",
  poster: m.type === "DOCUMENT" ? undefined : DEFAULT_POSTER,
});

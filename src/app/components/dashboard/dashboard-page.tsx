import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Layers,
  Medal,
  Percent,
  Pin,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatCard } from "../shared/stat-card";
import { StatCardSkeleton, ListRowSkeleton } from "../shared/skeletons";
import { Stagger, StaggerItem, FadeIn } from "../shared/motion";
import { Pagination } from "../shared/pagination";
import { cardSurface, interactiveCard, softShadow } from "../shared/surface";
import { MaterialTypeBadge } from "../shared/material-type-badge";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { usePagination } from "../../lib/use-pagination";
import { notices } from "../../lib/mock-data";
import {
  getStudentMaterials,
  getStudentPerformance,
  getStudentProfile,
  type StudentPerformance,
  type StudentProfile,
} from "../../lib/api";
import { toMaterial, type MaterialRow } from "../materials/materials-page";
import type { Material } from "../../lib/types";
import type { PageKey } from "../layout/nav";

const NOTICES_PER_PAGE = 3;

export function DashboardPage({
  onNavigate,
  onOpen,
}: {
  onNavigate: (k: PageKey) => void;
  onOpen: (m: Material) => void;
}) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [perf, setPerf] = useState<StudentPerformance | null>(null);
  const [mats, setMats] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // Dashboard data: profile (identity), performance (ranks/marks) and
  // materials (recent feed + total count) — all three come from the
  // student-scoped endpoints added for this portal.
  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const [p, f, m] = await Promise.all([
        getStudentProfile(),
        getStudentPerformance(),
        getStudentMaterials(),
      ]);
      setProfile(p);
      setPerf(f);
      setMats(m.materials.map(toMaterial)); // already newest-first from the API
    } catch (error: any) {
      console.error("Dashboard load failed:", error);
      setLoadErr(
        error?.response?.data?.msg ??
          error?.message ??
          "Could not load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const recent = mats.slice(0, 4);
  const greeting = getGreeting();
  const noticePager = usePagination(notices, NOTICES_PER_PAGE);

  const s = perf?.summary;
  const classSize = perf?.classSize ?? 0;
  const rankPct =
    s?.currentRank != null && classSize > 0
      ? Math.round((s.currentRank / classSize) * 100)
      : null;
  const latestPaper = perf?.papers.length
    ? perf.papers[perf.papers.length - 1].paper_name
    : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting}, ${profile?.user.first_name ?? "there"}`}
        subtitle="Here's where you stand this term. Keep the momentum going."
      />

      {loadErr && (
        <div
          className={cn(
            cardSurface,
            "flex flex-col items-center gap-4 p-16 text-center",
          )}
        >
          <p className="text-sm text-destructive">{loadErr}</p>
          <Button variant="outline" onClick={load} className="rounded-xl">
            Try again
          </Button>
        </div>
      )}

      {/* Hero card */}
      {loading ? (
        <div className={cn(cardSurface, "h-44 animate-pulse rounded-2xl")} />
      ) : !loadErr && profile ? (
        <FadeIn delay={0.04}>
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8",
              softShadow,
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.16),transparent_42%)]" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs backdrop-blur">
                  <Sparkles className="size-3.5" />
                  {profile.batch.name}
                </span>
                <div>
                  <p className="font-display text-2xl tracking-tight sm:text-[1.75rem]">
                    {profile.user.first_name} {profile.user.last_name}
                  </p>
                  <p className="mt-1 text-sm text-primary-foreground/75">
                    {profile.school}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono">
                    {profile.call_up_no}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:max-w-xs sm:grid-cols-2">
                <HeroStat
                  label="Current rank"
                  value={`#${s?.currentRank ?? "—"}`}
                  caption={`of ${classSize}`}
                />
                <HeroStat
                  label="Average mark"
                  value={`${s?.averageMark ?? "—"}`}
                  caption="out of 100"
                />
              </div>
            </div>
          </div>
        </FadeIn>
      ) : null}

      {/* Inspirational strip */}
    {/*  <FadeIn delay={0.06}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Flame className="size-5" />
              </div>
              <div>
                <p className="font-mono text-xl tracking-tight text-amber-700">
                  {studyStreak} tests
                </p>
                <p className="text-xs text-amber-700/80">Improvement streak 🔥</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 sm:col-span-2">
            <Quote className="absolute -right-2 -top-2 size-16 text-violet-200" />
            <p className="relative text-sm leading-relaxed text-violet-900">
              "{dailyQuote.text}"
            </p>
            <p className="relative mt-2 font-mono text-xs text-violet-700/80">
              — {dailyQuote.author}
            </p>
          </div>
        </div>
      </FadeIn>*}

      {/* Quick stats */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : !loadErr ? (
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Current Rank"
              value={`#${s?.currentRank ?? "—"}`}
              icon={Medal}
              tone="indigo"
              hint={rankPct != null ? `Top ${rankPct}% of class` : undefined}
            />
            <StatCard
              label="Average Mark"
              value={s?.averageMark ?? "—"}
              suffix="/ 100"
              icon={Percent}
              tone="violet"
            />
            <StatCard
              label="Latest Mark"
              value={s?.latestMark ?? "—"}
              suffix="/ 100"
              icon={Target}
              tone="emerald"
              hint={latestPaper}
            />
            <StatCard
              label="Total Materials"
              value={mats.length}
              icon={Layers}
              tone="sky"
              hint="Available to you"
            />
          </Stagger>
        ) : null}
      </section>

      {/* Notice board + recent materials */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Notice board — most important (still mock; wired up later) */}
        <section className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg tracking-tight">Notice Board</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
              <Pin className="size-3.5" />
              {notices.length} active
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ListRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
            <Stagger className="space-y-3">
              {noticePager.pageItems.map((n) => (
                <StaggerItem key={n.notice_id}>
                  <article
                    className={cn(
                      cardSurface,
                      "p-5",
                      n.pinned && "ring-1 ring-primary/15",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                          n.pinned
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-primary",
                        )}
                      >
                        {n.pinned ? (
                          <Pin className="size-4" />
                        ) : (
                          <CalendarDays className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[0.975rem] tracking-tight">
                            {n.title}
                          </h3>
                          <time className="shrink-0 font-mono text-xs text-muted-foreground">
                            {formatLong(n.date)}
                          </time>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
            <Pagination
              page={noticePager.page}
              pageCount={noticePager.pageCount}
              onChange={noticePager.setPage}
              from={noticePager.from}
              to={noticePager.to}
              total={noticePager.total}
              label="notices"
            />
            </div>
          )}
        </section>

        {/* Recent materials — real data from the student materials endpoint */}
        {!loadErr && (
          <section className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg tracking-tight">Recent Materials</h2>
              <button
                onClick={() => onNavigate("materials")}
                className="inline-flex items-center gap-0.5 text-sm text-primary transition-opacity hover:opacity-70"
              >
                View all
                <ArrowUpRight className="size-4" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div
                className={cn(
                  cardSurface,
                  "p-8 text-center text-sm text-muted-foreground",
                )}
              >
                No materials shared with your class yet.
              </div>
            ) : (
              <Stagger className="space-y-3">
                {recent.map((m) => (
                  <StaggerItem key={m.material_id}>
                    <button
                      onClick={() => onOpen(m)}
                      className={cn(
                        interactiveCard,
                        "flex w-full items-center gap-3.5 p-4 text-left",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          m.type === "PDF"
                            ? "bg-accent text-primary"
                            : "bg-success/10 text-success",
                        )}
                      >
                        {m.type === "PDF" ? (
                          <FileText className="size-[18px]" />
                        ) : (
                          <PlayCircle className="size-[18px]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm tracking-tight text-foreground">
                          {m.material_name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {m.lesson_title} · {formatLong(m.date_added)}
                        </p>
                      </div>
                      <MaterialTypeBadge type={m.type} />
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur">
      <p className="text-xs text-primary-foreground/70">{label}</p>
      <p className="mt-1 font-mono text-2xl tracking-tight">{value}</p>
      <p className="text-xs text-primary-foreground/60">{caption}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// e.g. 2026-03-12T00:00:00.000Z → "12 Mar 2026"
const formatLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

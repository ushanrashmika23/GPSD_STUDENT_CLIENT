import {
  Award,
  ChevronDown,
  Crown,
  Medal,
  MessageSquareText,
  Percent,
  Search,
  SearchX,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "../shared/page-header";
import { StatCard } from "../shared/stat-card";
import { ChartSkeleton, ListRowSkeleton, StatCardSkeleton } from "../shared/skeletons";
import { FadeIn, Stagger, StaggerItem } from "../shared/motion";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { cardSurface } from "../shared/surface";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { toneFor } from "../../lib/accents";
import { usePagination } from "../../lib/use-pagination";
import { getStudentPerformance, type StudentPerformance } from "../../lib/api";

const RESULTS_PER_PAGE = 5;

export function PerformancePage() {
  const [perf, setPerf] = useState<StudentPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [query, setQuery] = useState("");

  // GET /api/marks/student-performance/:userId (userId from the stored login user)
  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      setPerf(await getStudentPerformance());
    } catch (error: any) {
      console.error("Performance load failed:", error);
      setLoadErr(
        error?.response?.data?.msg ??
          error?.message ??
          "Could not load your performance data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const papers = perf?.papers ?? [];

  // Chart rows — backend returns papers oldest → newest already
  const markSeries = useMemo(
    () =>
      papers.map((p) => ({
        label: shortDate(p.paper_date),
        mark: p.mark,
        classAvg: p.class_avg,
      })),
    [papers],
  );

  const rankSeries = useMemo(
    () =>
      papers.map((p) => ({
        label: shortDate(p.paper_date),
        rank: p.rank ?? 0,
      })),
    [papers],
  );

  // Results list — newest first
  const results = useMemo(
    () =>
      [...papers]
        .sort(
          (a, b) =>
            new Date(b.paper_date).getTime() - new Date(a.paper_date).getTime(),
        )
        .map((p) => ({
          material_id: p.paper_id,
          test_name: p.paper_name,
          lesson_name: p.lesson_title,
          lesson_id: p.lesson_id ?? "",
          date: p.paper_date,
          mark: p.mark,
          rank: p.rank ?? 0,
          comments: p.comments,
        })),
    [papers],
  );

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        r.test_name.toLowerCase().includes(q) ||
        r.lesson_name.toLowerCase().includes(q) ||
        r.comments.toLowerCase().includes(q),
    );
  }, [query, results]);

  const { page, setPage, pageCount, pageItems, from, to, total } = usePagination(
    filteredResults,
    RESULTS_PER_PAGE,
    [query],
  );

  const s = perf?.summary;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Performance"
        subtitle="Track your marks and class rank across every graded test this term."
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

      {!loadErr && !loading && papers.length === 0 && (
        <EmptyState
          icon={Award}
          title="No results published yet"
          description="Your marks will appear here once the institute releases your first test results."
        />
      )}

      {!loadErr && !loading && papers.length > 0 && (
        <>
          {/* Summary cards */}
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Current Rank"
              value={`#${s?.currentRank ?? "—"}`}
              icon={Medal}
              tone="indigo"
              hint={`of ${perf?.classSize ?? 0} students`}
            />
            <StatCard
              label="Best Rank"
              value={`#${s?.bestRank ?? "—"}`}
              icon={Crown}
              tone="amber"
              hint="Personal best"
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
            />
          </Stagger>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <FadeIn delay={0.04}>
              <ChartCard
                title="Marks Progress"
                caption="Your marks vs. class average"
                icon={TrendingUp}
                legend={
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Legend swatch="bg-primary" label="You" />
                    <Legend swatch="bg-slate-300" dashed label="Class avg" />
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={markSeries}
                    margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="markFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTick}
                      dy={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={axisTick}
                      width={40}
                    />
                    <Tooltip
                      content={<MarkTooltip />}
                      cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                    />
                    {/* Class average benchmark — muted dashed line */}
                    <Line
                      type="monotone"
                      dataKey="classAvg"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 4, fill: "#94a3b8", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mark"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#markFill)"
                      dot={{ r: 3, fill: "#4f46e5", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </FadeIn>

            <FadeIn delay={0.08}>
              <ChartCard
                title="Rank History"
                caption="Class rank over time (lower is better)"
                icon={Award}
              >
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={rankSeries}
                    margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={axisTick}
                      dy={8}
                    />
                    <YAxis
                      reversed
                      domain={[1, "dataMax + 4"]}
                      tickLine={false}
                      axisLine={false}
                      tick={axisTick}
                      width={40}
                      tickFormatter={(v) => `#${v}`}
                    />
                    <Tooltip
                      content={<RankTooltip />}
                      cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rank"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </FadeIn>
          </div>

          {/* Results history */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg tracking-tight">Results History</h2>
              <div className="relative sm:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tests or feedback…"
                  className="h-11 rounded-xl pl-11"
                />
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No results found"
                description="No graded tests match your search. Try a different test name, lesson or keyword."
              />
            ) : (
              <div className="space-y-4">
                <Stagger className="space-y-3">
                  {pageItems.map((r) => (
                    <StaggerItem key={r.material_id}>
                      <ResultCard
                        testName={r.test_name}
                        lesson={r.lesson_name}
                        lessonId={r.lesson_id}
                        date={r.date}
                        mark={r.mark}
                        rank={r.rank}
                        comments={r.comments}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>

                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onChange={setPage}
                  from={from}
                  to={to}
                  total={total}
                  label="results"
                />
              </div>
            )}
          </section>
        </>
      )}

      {/* Loading skeletons (also covers the initial fetch) */}
      {loading && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ListRowSkeleton key={i} />
            ))}
          </div>
        </>
      )}
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

// e.g. 2026-03-12T00:00:00.000Z → "12 Mar" (chart axis label)
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

const axisTick = { fill: "#64748b", fontSize: 12, fontFamily: "JetBrains Mono" };

function Legend({
  swatch,
  label,
  dashed,
}: {
  swatch: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-0.5 w-4 rounded-full",
          swatch,
          dashed && "[mask-image:repeating-linear-gradient(to_right,black_0_4px,transparent_4px_8px)]",
        )}
      />
      {label}
    </span>
  );
}

function ChartCard({
  title,
  caption,
  icon: Icon,
  legend,
  children,
}: {
  title: string;
  caption: string;
  icon: typeof TrendingUp;
  legend?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(cardSurface, "p-6")}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
            <Icon className="size-[18px]" />
          </div>
          <div>
            <h3 className="text-[0.975rem] tracking-tight">{title}</h3>
            <p className="text-xs text-muted-foreground">{caption}</p>
          </div>
        </div>
        {legend}
      </div>
      {children}
    </div>
  );
}

function ResultCard({
  testName,
  lesson,
  lessonId,
  date,
  mark,
  rank,
  comments,
}: {
  testName: string;
  lesson: string;
  lessonId: string;
  date: string;
  mark: number;
  rank: number;
  comments: string;
}) {
  const [open, setOpen] = useState(false);
  const tone = toneFor(lessonId);
  return (
    <div className={cn(cardSurface, "overflow-hidden")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span className={cn("hidden h-12 w-1.5 shrink-0 rounded-full sm:block", tone.solid)} />

        <div className="min-w-0 flex-1 space-y-2">
          {/* 1 · Date */}
          <time className="font-mono text-xs text-muted-foreground">
            {formatLong(date)}
          </time>
          {/* 2 · Title (below date) */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.975rem] tracking-tight">{testName}</p>
            <span className={cn("rounded-md px-2 py-0.5 text-xs", tone.soft)}>
              {lesson}
            </span>
          </div>
          {/* 3 · Marks  ·  4 · Rank */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mark</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {mark}
                <span className="text-muted-foreground">/100</span>
              </span>
              <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:block">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${mark}%` }}
                />
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Rank</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-xs text-foreground">
                <Medal className="size-3.5 text-primary" />#{rank}
              </span>
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <FadeIn y={-4}>
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-start gap-2.5 rounded-xl bg-secondary/60 p-3.5">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-foreground">{comments}</p>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

function MarkTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <TooltipShell>
      <p className="font-mono text-lg tracking-tight text-foreground">
        {row.mark}
        <span className="text-sm text-muted-foreground"> / 100</span>
      </p>
      {row.classAvg != null && (
        <p className="font-mono text-xs text-slate-400">
          Class avg · {row.classAvg}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{row.label}</p>
    </TooltipShell>
  );
}

function RankTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipShell>
      <p className="font-mono text-lg tracking-tight text-success">
        #{payload[0].value}
      </p>
      <p className="text-xs text-muted-foreground">{payload[0].payload.label}</p>
    </TooltipShell>
  );
}

function TooltipShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
      {children}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Maximize2,
  Pause,
  Play,
  PlayCircle,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { cardSurface, interactiveCard } from "../shared/surface";
import { cn } from "../ui/utils";
import { toneFor } from "../../lib/accents";
import { getMaterialSignedUrl, getStudentMaterials } from "../../lib/api";
import type { Material } from "../../lib/types";

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(r).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Default thumbnail for the up-next cards (the DB stores no poster images).
const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1561089489-f13d5e730d72?w=1200&h=675&fit=crop&auto=format";

export function VideoPlayerPage({
  material,
  onBack,
  onOpenMaterial,
}: {
  material: Material & { lesson_title?: string };
  onBack: () => void;
  onOpenMaterial: (m: Material) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [upNext, setUpNext] = useState<(Material & { lesson_title?: string })[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tone = toneFor(material.lesson_id);

  // GET /api/materials/:id/signed-url — fetch a fresh signed R2 URL for the file
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await getMaterialSignedUrl(material.material_id);
      setUrl(res.url);
    } catch (error: any) {
      console.error("Signed URL fetch failed:", error);
      setErr(
        error?.response?.data?.msg ??
          error?.message ??
          "Could not load this recording."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPlaying(false);
    setT(0);
    setDuration(0);
    load();
  }, [material.material_id]);

  // Up next: other recordings shared with this student's batch (real data)
  useEffect(() => {
    getStudentMaterials()
      .then((data) => {
        setUpNext(
          data.materials
            .filter(
              (m) => m.type !== "DOCUMENT" && m.material_id !== material.material_id,
            )
            .slice(0, 4)
            .map((m) => ({
              material_id: m.material_id,
              material_name: m.material_name,
              lesson_id: m.lesson_id,
              lesson_title: m.lesson_title,
              source_url: m.material_url,
              date_added: m.date_added,
              description: m.description,
              type: "Recording",
              poster: DEFAULT_POSTER,
            })),
        );
      })
      .catch((e) => console.error("Up next fetch failed:", e));
  }, [material.material_id]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch((e) => console.error("Play failed:", e));
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    playerRef.current?.requestFullscreen?.();
  };

  const seek = (e: React.MouseEvent) => {
    const el = barRef.current;
    const v = videoRef.current;
    if (!el || !v || !duration) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
  };

  const progress = duration ? (t / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top bar — NOTE: recordings cannot be downloaded, so no download
          control is rendered here (download stays a PDF-only feature). */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <p className="text-sm text-muted-foreground">Now playing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Player */}
          <div
            ref={playerRef}
            className={cn(
              "group relative aspect-video overflow-hidden rounded-2xl bg-slate-900",
              cardSurface,
            )}
          >
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900">
                <Loader2 className="size-6 animate-spin text-white/70" />
              </div>
            )}

            {err && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900">
                <p className="px-6 text-center text-sm text-white/70">{err}</p>
                <Button variant="outline" className="rounded-xl" onClick={load}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              </div>
            )}

            {/* The real recording */}
            {!loading && !err && (
              <video
                ref={videoRef}
                src={url}
                poster={material.poster}
                playsInline
                preload="metadata"
                onClick={togglePlay}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                className="absolute inset-0 size-full cursor-pointer object-contain"
              />
            )}

            {/* Center play / pause */}
            {!loading && !err && !playing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40"
                aria-label="Play"
              >
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex size-20 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-transform hover:scale-105"
                >
                  <Play className="size-9 translate-x-0.5 fill-white" />
                </motion.span>
              </button>
            )}

            {/* Lesson badge */}
            <span className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs text-white backdrop-blur">
              <span className={cn("size-1.5 rounded-full", tone.solid)} />
              {material.lesson_title ?? "Recording"}
            </span>

            {/* Controls */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 space-y-2 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-3.5 pt-10">
              <div
                ref={barRef}
                onClick={seek}
                className="pointer-events-auto h-1.5 cursor-pointer rounded-full bg-white/25"
              >
                <div
                  className="relative h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                >
                  <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100" />
                </div>
              </div>
              <div className="pointer-events-auto flex items-center gap-3 text-white">
                <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? (
                    <Pause className="size-5 fill-white" />
                  ) : (
                    <Play className="size-5 fill-white" />
                  )}
                </button>
                <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                  {muted ? (
                    <VolumeX className="size-[18px] opacity-90" />
                  ) : (
                    <Volume2 className="size-[18px] opacity-90" />
                  )}
                </button>
                <span className="font-mono text-xs tabular-nums">
                  {fmt(t)} <span className="opacity-60">/ {fmt(duration)}</span>
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={fullscreen} aria-label="Fullscreen">
                    <Maximize2 className="size-[18px] opacity-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className={cn(cardSurface, "p-6")}>
            <h1 className="text-[1.4rem] leading-tight tracking-tight">
              {material.material_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("rounded-md px-2 py-0.5 text-xs", tone.soft)}>
                {material.lesson_title ?? "Recording"}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                <CalendarDays className="size-3.5" />
                {formatLong(material.date_added)}
              </span>
              {duration > 0 && (
                <span className="font-mono text-xs">· {fmt(duration)}</span>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {material.description}
            </p>
          </div>
        </div>

        {/* Up next */}
        <aside className="space-y-3">
          <h2 className="text-lg tracking-tight">Up next</h2>
          {upNext.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No other recordings shared with your class yet.
            </p>
          )}
          {upNext.map((m) => {
            const t2 = toneFor(m.lesson_id);
            return (
              <button
                key={m.material_id}
                onClick={() => onOpenMaterial(m)}
                className={cn(interactiveCard, "flex w-full gap-3 p-3 text-left")}
              >
                <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  <ImageWithFallback
                    src={m.poster}
                    alt={m.material_name}
                    className="size-full object-cover opacity-85"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="size-6 text-white/90" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug tracking-tight">
                    {m.material_name}
                  </p>
                  <span className={cn("mt-1.5 inline-block rounded px-1.5 py-0.5 text-[0.7rem]", t2.soft)}>
                    {m.lesson_title ?? "Recording"}
                  </span>
                </div>
              </button>
            );
          })}
        </aside>
      </div>
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

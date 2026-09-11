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
  PictureInPicture2,
  RefreshCw,
  SkipBack,
  SkipForward,
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

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP_SECONDS = 10;
const CONTROLS_HIDE_MS = 2600;

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
  const [buffering, setBuffering] = useState(false);
  const [t, setT] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [upNext, setUpNext] = useState<(Material & { lesson_title?: string })[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const clickTimer = useRef<number | null>(null);
  const tone = toneFor(material.lesson_id);
  const posKey = `gpsd-video-pos-${material.material_id}`;

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
    setBufferedEnd(0);
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

  // ── Resume playback where the student left off (per material) ────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const save = () => {
      if (v.duration && v.currentTime > 3 && v.currentTime < v.duration - 3) {
        localStorage.setItem(posKey, String(v.currentTime));
      } else {
        localStorage.removeItem(posKey);
      }
    };
    const iv = window.setInterval(save, 2000);
    v.addEventListener("pause", save);
    return () => {
      window.clearInterval(iv);
      v.removeEventListener("pause", save);
      save();
    };
  }, [posKey]);

  // ── Auto-hide controls while playing; any hover/action wakes them ────────
  const wake = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
        setSpeedOpen(false);
      }
    }, CONTROLS_HIDE_MS);
  };

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
    },
    [],
  );

  // ── Player actions (all ref-based so keyboard handlers can capture them) ──
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch((e) => console.error("Play failed:", e));
    } else {
      v.pause();
    }
    wake();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    wake();
  };

  const changeVolume = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const next = Math.min(1, Math.max(0, v.volume + delta));
    v.volume = next;
    v.muted = next === 0;
    setVolume(next);
    setMuted(v.muted);
    wake();
  };

  const skip = (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    const max = Number.isFinite(v.duration) ? v.duration : v.currentTime + sec;
    v.currentTime = Math.min(Math.max(0, v.currentTime + sec), max);
    setT(v.currentTime);
    wake();
  };

  const fullscreen = () => {
    playerRef.current?.requestFullscreen?.();
  };

  const togglePip = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture?.();
      }
    } catch (e) {
      console.error("PiP failed:", e);
    }
    wake();
  };

  const setRate = (s: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setSpeedOpen(false);
    wake();
  };

  // ── Click vs double-click: single toggles play, double toggles fullscreen ─
  const onVideoClick = () => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      fullscreen();
    } else {
      clickTimer.current = window.setTimeout(() => {
        clickTimer.current = null;
        togglePlay();
      }, 220);
    }
  };

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "BUTTON" ||
          el.isContentEditable)
      )
        return;
      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          fullscreen();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-SKIP_SECONDS);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(SKIP_SECONDS);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(-0.05);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the speed menu on outside click
  useEffect(() => {
    if (!speedOpen) return;
    const onDown = (e: MouseEvent) => {
      if (speedRef.current && !speedRef.current.contains(e.target as Node)) {
        setSpeedOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [speedOpen]);

  // ── Progress bar (seek + hover time preview + drag) ──────────────────────
  const seekToRatio = (clientX: number) => {
    const el = barRef.current;
    const v = videoRef.current;
    if (!el || !v || !duration) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
    setT(v.currentTime);
    wake();
  };

  const onBarMove = (e: React.MouseEvent) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverPct(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
    if (e.buttons & 1) seekToRatio(e.clientX); // drag while held
  };

  const progress = duration ? (t / duration) * 100 : 0;
  const bufferedPct = duration ? (bufferedEnd / duration) * 100 : 0;
  const controlsShown = controlsVisible || !playing || buffering;

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
            onMouseMove={wake}
            className={cn(
              "group relative aspect-video overflow-hidden rounded-2xl bg-slate-900",
              cardSurface,
              controlsShown ? "" : "cursor-none",
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
                onClick={onVideoClick}
                onPlay={() => {
                  setPlaying(true);
                  setBuffering(false);
                  wake();
                }}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onWaiting={() => setBuffering(true)}
                onCanPlay={() => setBuffering(false)}
                onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
                onProgress={() => {
                  const v = videoRef.current;
                  if (!v || !v.buffered.length) return;
                  let end = v.buffered.end(v.buffered.length - 1);
                  for (let i = 0; i < v.buffered.length; i++) {
                    if (
                      v.buffered.start(i) <= v.currentTime &&
                      v.currentTime <= v.buffered.end(i)
                    ) {
                      end = v.buffered.end(i);
                      break;
                    }
                  }
                  setBufferedEnd(end);
                }}
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  if (Number.isFinite(v.duration)) setDuration(v.duration);
                  // Resume where the student left off (if they got anywhere)
                  const saved = parseFloat(localStorage.getItem(posKey) || "");
                  if (Number.isFinite(saved) && saved > 3 && saved < v.duration - 3) {
                    v.currentTime = saved;
                  }
                }}
                className="absolute inset-0 size-full cursor-pointer object-contain"
              />
            )}

            {/* Buffering spinner (during playback, after the initial load) */}
            {!loading && !err && playing && buffering && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <Loader2 className="size-7 animate-spin text-white/80 drop-shadow" />
              </div>
            )}

            {/* Center play / pause */}
            {!loading && !err && !playing && !buffering && (
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
            <motion.div
              initial={false}
              animate={{ opacity: controlsShown ? 1 : 0, y: controlsShown ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 space-y-2 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent px-4 pb-3.5 pt-12"
            >
              {/* Progress bar with buffered range, hover time preview, drag */}
              <div
                ref={barRef}
                onClick={(e) => seekToRatio(e.clientX)}
                onMouseMove={onBarMove}
                onMouseLeave={() => setHoverPct(null)}
                className={cn(
                  "group/bar relative flex h-4 items-center",
                  controlsShown ? "pointer-events-auto" : "pointer-events-none",
                )}
              >
                {/* Buffered */}
                <div
                  className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25"
                  style={{ width: `${bufferedPct}%` }}
                />
                {/* Played */}
                <div
                  className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-white shadow transition-transform",
                    controlsShown ? "scale-100" : "scale-0",
                  )}
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
                {/* Hover time preview */}
                {hoverPct !== null && duration > 0 && controlsShown && (
                  <span
                    className="pointer-events-none absolute bottom-full mb-1.5 -translate-x-1/2 rounded-md bg-slate-900/95 px-2 py-0.5 font-mono text-[0.7rem] tabular-nums text-white shadow-lg"
                    style={{ left: `${hoverPct * 100}%` }}
                  >
                    {fmt(hoverPct * duration)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex flex-wrap items-center gap-3 text-white",
                  controlsShown ? "pointer-events-auto" : "pointer-events-none",
                )}
              >
                <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? (
                    <Pause className="size-5 fill-white" />
                  ) : (
                    <Play className="size-5 fill-white" />
                  )}
                </button>
                <button
                  onClick={() => skip(-SKIP_SECONDS)}
                  title={`Back ${SKIP_SECONDS}s`}
                  aria-label={`Back ${SKIP_SECONDS} seconds`}
                >
                  <SkipBack className="size-[18px] opacity-90" />
                </button>
                <button
                  onClick={() => skip(SKIP_SECONDS)}
                  title={`Forward ${SKIP_SECONDS}s`}
                  aria-label={`Forward ${SKIP_SECONDS} seconds`}
                >
                  <SkipForward className="size-[18px] opacity-90" />
                </button>

                {/* Volume: hover reveals a slider */}
                <div className="group/vol flex items-center">
                  <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                    {muted || volume === 0 ? (
                      <VolumeX className="size-[18px] opacity-90" />
                    ) : (
                      <Volume2 className="size-[18px] opacity-90" />
                    )}
                  </button>
                  <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const v = videoRef.current;
                        if (v) {
                          v.volume = val;
                          v.muted = val === 0;
                          setMuted(v.muted);
                        }
                        setVolume(val);
                        wake();
                      }}
                      aria-label="Volume"
                      className="w-20 accent-primary"
                    />
                  </div>
                </div>

                <span className="font-mono text-xs tabular-nums">
                  {fmt(t)} <span className="opacity-60">/ {fmt(duration)}</span>
                </span>

                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={togglePip}
                    title="Picture in picture"
                    aria-label="Picture in picture"
                    className="hidden sm:block"
                  >
                    <PictureInPicture2 className="size-[18px] opacity-90" />
                  </button>

                  {/* Playback speed */}
                  <div className="relative" ref={speedRef}>
                    <button
                      onClick={() => setSpeedOpen((o) => !o)}
                      title="Playback speed"
                      aria-label="Playback speed"
                      className={cn(
                        "min-w-9 rounded-md px-1.5 py-1 font-mono text-xs tabular-nums transition-colors",
                        speedOpen || speed !== 1
                          ? "bg-white/15"
                          : "hover:bg-white/10",
                      )}
                    >
                      {speed === 1 ? "1×" : `${speed}×`}
                    </button>
                    {speedOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-24 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 py-1 shadow-xl backdrop-blur">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => setRate(s)}
                            className={cn(
                              "block w-full px-3 py-1.5 text-left font-mono text-xs tabular-nums text-white/75 transition-colors hover:bg-white/10 hover:text-white",
                              s === speed && "text-primary hover:text-primary",
                            )}
                          >
                            {s}×
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={fullscreen} aria-label="Fullscreen">
                    <Maximize2 className="size-[18px] opacity-90" />
                  </button>
                </div>
              </div>
            </motion.div>
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

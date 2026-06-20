import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Maximize2,
  Pause,
  PlayCircle,
  Play,
  Settings,
  Volume2,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { cardSurface, interactiveCard } from "../shared/surface";
import { cn } from "../ui/utils";
import { toneFor } from "../../lib/accents";
import { formatLong, lessonName, materials } from "../../lib/mock-data";
import type { Material } from "../../lib/types";

function toSeconds(d?: string) {
  if (!d) return 3600;
  const parts = d.split(":").map(Number);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(r).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function VideoPlayerPage({
  material,
  onBack,
  onOpenMaterial,
}: {
  material: Material;
  onBack: () => void;
  onOpenMaterial: (m: Material) => void;
}) {
  const duration = toSeconds(material.duration);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const tone = toneFor(material.lesson_id);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlaying(false);
    setT(0);
  }, [material.material_id]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((prev) => {
        if (prev >= duration) {
          setPlaying(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, duration]);

  const progress = duration ? (t / duration) * 100 : 0;

  const seek = (e: React.MouseEvent) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setT(Math.round(ratio * duration));
  };

  const upNext = materials
    .filter((m) => m.type === "Recording" && m.material_id !== material.material_id)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top bar */}
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
            className={cn(
              "group relative aspect-video overflow-hidden rounded-2xl bg-slate-900",
              cardSurface,
            )}
          >
            <ImageWithFallback
              src={material.poster}
              alt={`${material.material_name} thumbnail`}
              className={cn(
                "size-full object-cover transition-all duration-500",
                playing ? "scale-105 opacity-40 blur-[2px]" : "opacity-70",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-slate-950/30" />

            {/* Center play / pause */}
            <button
              onClick={() => setPlaying((p) => !p)}
              className="absolute inset-0 flex items-center justify-center"
              aria-label={playing ? "Pause" : "Play"}
            >
              {!playing && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex size-20 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-transform hover:scale-105"
                >
                  <Play className="size-9 translate-x-0.5 fill-white" />
                </motion.span>
              )}
            </button>

            {/* Live badge */}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs text-white backdrop-blur">
              <span className={cn("size-1.5 rounded-full", tone.solid)} />
              {lessonName(material.lesson_id)}
            </span>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-3.5 pt-10">
              <div
                ref={barRef}
                onClick={seek}
                className="group/bar h-1.5 cursor-pointer rounded-full bg-white/25"
              >
                <div
                  className="relative h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                >
                  <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? (
                    <Pause className="size-5 fill-white" />
                  ) : (
                    <Play className="size-5 fill-white" />
                  )}
                </button>
                <Volume2 className="size-[18px] opacity-90" />
                <span className="font-mono text-xs tabular-nums">
                  {fmt(t)} <span className="opacity-60">/ {fmt(duration)}</span>
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <Settings className="size-[18px] opacity-90" />
                  <Maximize2 className="size-[18px] opacity-90" />
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
                {lessonName(material.lesson_id)}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                <CalendarDays className="size-3.5" />
                {formatLong(material.date_added)}
              </span>
              {material.duration && (
                <span className="font-mono text-xs">· {material.duration}</span>
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
                  {m.duration && (
                    <span className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1 font-mono text-[0.6rem] text-white">
                      {m.duration}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-snug tracking-tight">
                    {m.material_name}
                  </p>
                  <span className={cn("mt-1.5 inline-block rounded px-1.5 py-0.5 text-[0.7rem]", t2.soft)}>
                    {lessonName(m.lesson_id)}
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

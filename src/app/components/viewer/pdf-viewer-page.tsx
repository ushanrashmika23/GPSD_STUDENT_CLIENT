import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { cardSurface } from "../shared/surface";
import { cn } from "../ui/utils";
import { toneFor } from "../../lib/accents";
import { getMaterialSignedUrl } from "../../lib/api";
import type { Material } from "../../lib/types";

export function PdfViewerPage({
  material,
  onBack,
}: {
  material: Material & { lesson_title?: string };
  onBack: () => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [downloading, setDownloading] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
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
          "Could not load this document."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [material.material_id]);

  // PDFs ARE allowed to download: pull the signed URL as a blob and save it.
  // Falls back to opening in a new tab if the R2 bucket blocks cross-origin fetch.
  const download = async () => {
    if (!url || downloading) return;
    setDownloading(true);
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${material.material_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Blob download failed, opening in a new tab:", error);
      window.open(url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  const fullscreen = () => {
    frameRef.current?.requestFullscreen?.();
  };

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
              {material.lesson_title ?? "General"}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <CalendarDays className="size-3.5" />
              {formatLong(material.date_added)}
            </span>
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={download}
          disabled={!url || downloading}
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={fullscreen}
          aria-label="Fullscreen"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Document viewport — the real PDF, rendered by the browser's viewer */}
        <div
          ref={frameRef}
          className={cn(cardSurface, "overflow-hidden bg-slate-100/70")}
        >
          {loading ? (
            <div className="flex h-[75vh] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : err ? (
            <div className="flex h-[75vh] flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-sm text-destructive">{err}</p>
              <Button variant="outline" className="rounded-xl" onClick={load}>
                <RefreshCw className="size-4" />
                Try again
              </Button>
            </div>
          ) : (
            <iframe
              key={url}
              src={url}
              title={material.material_name}
              className="h-[75vh] w-full border-0"
              allowFullScreen
            />
          )}
        </div>

        {/* Info */}
        <aside className="space-y-4">
          <div className={cn(cardSurface, "p-5")}>
            <div className="flex items-center gap-2.5">
              <div className={cn("flex size-9 items-center justify-center rounded-xl", tone.soft)}>
                <FileText className="size-[18px]" />
              </div>
              <div>
                <p className="text-sm tracking-tight">Document details</p>
                <p className="text-xs text-muted-foreground">
                  {material.lesson_title ?? "General"} · PDF
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {material.description}
            </p>
          </div>
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

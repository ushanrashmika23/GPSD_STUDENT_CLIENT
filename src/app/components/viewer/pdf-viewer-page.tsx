import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Maximize2,
  MoveHorizontal,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "../ui/button";
import { cardSurface } from "../shared/surface";
import { cn } from "../ui/utils";
import { toneFor } from "../../lib/accents";
import { getMaterialFileBlobUrl } from "../../lib/api";
import { formatLong } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import type { Material } from "../../lib/types";

// pdf.js worker — bundled by Vite as an asset (pdfjs-dist 5.x ships the
// module worker at this path).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export function PdfViewerPage({
  material,
  onBack,
}: {
  material: Material & { lesson_title?: string };
  onBack: () => void;
}) {
  const { t, lang } = useI18n();
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [pageWidth, setPageWidth] = useState(0); // PDF pts at scale 1
  const [containerW, setContainerW] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fileUrlRef = useRef("");
  const tone = toneFor(material.lesson_id);

  // GET /api/materials/:id/file — fetch the document bytes through the backend
  // (no R2 CORS dependency) and hand pdf.js a local blob URL.
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const url = await getMaterialFileBlobUrl(material.material_id);
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = url;
      setFileUrl(url);
      setPageNumber(1);
      setNumPages(0);
    } catch (error: any) {
      console.error("PDF fetch failed:", error);
      setErr(
        error?.response?.data?.msg ??
          error?.message ??
          t("viewer.couldNotLoad")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [material.material_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Revoke the blob URL when the viewer unmounts
  useEffect(
    () => () => {
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    },
    [],
  );

  // Track the viewport width so "fit width" tracks window resizes
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keyboard: ← / → turn pages (unless typing in an input)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPageNumber((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPageNumber((p) => Math.min(numPages || p, p + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  // Fit width: scale the page to the container (with some padding)
  const fitScale =
    pageWidth && containerW
      ? clampScale((containerW - 48) / pageWidth)
      : 1;
  const effectiveScale = fitWidth ? fitScale : scale;

  const zoom = (delta: number) => {
    setFitWidth(false);
    setScale((s) => clampScale(Math.round((s + delta) * 100) / 100));
  };

  const download = () => {
    if (!fileUrl || downloading) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `${material.material_name}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloading(false);
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
          {t("common.back")}
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.4rem] leading-tight tracking-tight">
            {material.material_name}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("rounded-md px-2 py-0.5 text-xs", tone.soft)}>
              {material.lesson_title ?? t("common.general")}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <CalendarDays className="size-3.5" />
              {formatLong(material.date_added, lang)}
            </span>
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={download}
          disabled={!fileUrl || downloading}
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t("viewer.download")}
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={fullscreen}
          aria-label={t("viewer.fullscreen")}
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Document viewport */}
        <div ref={frameRef} className={cn(cardSurface, "overflow-hidden")}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-2">
            <ToolBtn onClick={() => zoom(-0.1)} label={t("viewer.zoomOut")}>
              <ZoomOut className="size-4" />
            </ToolBtn>
            <button
              onClick={() => {
                setFitWidth(false);
                setScale(1);
              }}
              title={t("viewer.resetZoom")}
              className="min-w-14 rounded-md px-2 py-1.5 font-mono text-xs tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {Math.round(effectiveScale * 100)}%
            </button>
            <ToolBtn onClick={() => zoom(0.1)} label={t("viewer.zoomIn")}>
              <ZoomIn className="size-4" />
            </ToolBtn>
            <ToolBtn
              onClick={() => setFitWidth((f) => !f)}
              label={t("viewer.fitWidth")}
              active={fitWidth}
            >
              <MoveHorizontal className="size-4" />
            </ToolBtn>

            <div className="ml-auto flex items-center gap-1">
              <ToolBtn
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                label={t("viewer.previousPage")}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="size-4" />
              </ToolBtn>
              <span className="px-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                {pageNumber} / {numPages || "…"}
              </span>
              <ToolBtn
                onClick={() => setPageNumber((p) => Math.min(numPages || p, p + 1))}
                label={t("viewer.nextPage")}
                disabled={!!numPages && pageNumber >= numPages}
              >
                <ChevronRight className="size-4" />
              </ToolBtn>
            </div>
          </div>

          {/* Page area */}
          <div ref={viewportRef} className="bg-muted/40">
            {loading ? (
              <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("viewer.loadingDocument")}
                </p>
              </div>
            ) : err ? (
              <div className="flex h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-sm text-destructive">{err}</p>
                <Button variant="outline" className="rounded-xl" onClick={load}>
                  <RefreshCw className="size-4" />
                  {t("common.tryAgain")}
                </Button>
              </div>
            ) : (
              <div className="h-[70vh] overflow-y-auto p-6">
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages: n }) => {
                    setNumPages(n);
                    setPageNumber((p) => Math.min(p, n));
                  }}
                  loading={
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  }
                  error={
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                      <p className="text-sm text-destructive">
                        {t("viewer.couldNotRender")}
                      </p>
                      <Button variant="outline" className="rounded-xl" onClick={load}>
                        <RefreshCw className="size-4" />
                        {t("common.tryAgain")}
                      </Button>
                    </div>
                  }
                  className="mx-auto w-fit"
                >
                  <div className="mx-auto w-fit overflow-hidden rounded-lg bg-white shadow-md">
                    <Page
                      key={`${material.material_id}-${pageNumber}`}
                      pageNumber={pageNumber}
                      scale={effectiveScale}
                      onLoadSuccess={(page) => setPageWidth(page.viewport.width)}
                      loading={
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                      }
                    />
                  </div>
                </Document>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <aside className="space-y-4">
          <div className={cn(cardSurface, "p-5")}>
            <div className="flex items-center gap-2.5">
              <div className={cn("flex size-9 items-center justify-center rounded-xl", tone.soft)}>
                <FileText className="size-[18px]" />
              </div>
              <div>
                <p className="text-sm tracking-tight">
                  {t("viewer.documentDetails")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {material.lesson_title ?? t("common.general")} ·{" "}
                  {t("materialType.pdf")}
                  {numPages > 0
                    ? ` · ${t("viewer.page", { count: numPages })}`
                    : ""}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {material.description}
            </p>
          </div>
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            {t("viewer.tip")}
          </p>
        </aside>
      </div>
    </div>
  );
}

// Small icon button for the PDF toolbar
function ToolBtn({
  children,
  onClick,
  label,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

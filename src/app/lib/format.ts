import { localeFor, type Lang } from "./i18n/config";

// e.g. 2026-03-12T00:00:00.000Z → "12 Mar 2026" (en) · "2026 මාර්තු 12" (si)
export const formatLong = (iso: string, lang: Lang = "en") =>
  new Date(iso).toLocaleDateString(localeFor(lang), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Chart axis labels — e.g. "12 Mar"
export const shortDate = (iso: string, lang: Lang = "en") =>
  new Date(iso).toLocaleDateString(localeFor(lang), {
    day: "numeric",
    month: "short",
  });

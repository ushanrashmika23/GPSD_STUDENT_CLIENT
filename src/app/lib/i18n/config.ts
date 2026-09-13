// Shared language configuration — the i18n provider and the date formatters
// both read from here, so nothing has to be duplicated (or import in a cycle).

export type Lang = "en" | "si";

export const LANGS: Lang[] = ["en", "si"];

export const DEFAULT_LANG: Lang = "en";

// Where the student's chosen language is kept in the browser. Its presence is
// also what tells the app the first-login prompt has already been answered.
export const LANG_STORAGE_KEY = "lang";

// BCP-47 locale used for dates and numbers in each language
export const localeFor = (lang: Lang) => (lang === "si" ? "si-LK" : "en-GB");

export const isLang = (value: unknown): value is Lang =>
  value === "en" || value === "si";

// null = nothing chosen yet (first login)
export const readStoredLang = (): Lang | null => {
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const storeLang = (lang: Lang) => {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage blocked (private mode) — the language still applies this session
  }
};

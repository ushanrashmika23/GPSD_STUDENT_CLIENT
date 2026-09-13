import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "./locales/en.json";
import si from "./locales/si.json";
import {
  DEFAULT_LANG,
  localeFor,
  readStoredLang,
  storeLang,
  type Lang,
} from "./config";

// Every UI string lives in these two files. Adding UI text means adding the key
// to BOTH — `en` is also the fallback whenever a `si` key is missing.
const locales: Record<Lang, unknown> = { en, si };

type Vars = Record<string, string | number>;

// Resolve a "dashboard.noticeBoard" path against a locale object
const lookup = (dict: unknown, path: string): string | undefined => {
  const value = path
    .split(".")
    .reduce<any>((acc, key) => (acc == null ? acc : acc[key]), dict);
  return typeof value === "string" ? value : undefined;
};

// Replace {placeholders} with the values passed to t()
const interpolate = (template: string, vars?: Vars) =>
  vars
    ? template.replace(/\{(\w+)\}/g, (match, key) =>
        key in vars ? String(vars[key]) : match,
      )
    : template;

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a dot-path key; `{placeholders}` are filled from `vars`. */
  t: (key: string, vars?: Vars) => string;
  /** BCP-47 locale for the active language (dates, numbers). */
  locale: string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Restored synchronously from the browser so the first paint is already in
  // the student's language — no flash of English.
  const [lang, setLangState] = useState<Lang>(
    () => readStoredLang() ?? DEFAULT_LANG,
  );

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    storeLang(next);
  }, []);

  // Keeps <html lang> honest: screen readers, hyphenation and font fallback
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Vars) => {
      // Plural keys: pass a numeric `count` and the "_one"/"_other" variant of
      // the key is used (e.g. "materials.result" → "materials.result_other").
      const path =
        vars && typeof vars.count === "number"
          ? `${key}_${vars.count === 1 ? "one" : "other"}`
          : key;

      const text =
        lookup(locales[lang], path) ??
        lookup(locales[DEFAULT_LANG], path) ??
        lookup(locales[lang], key) ??
        lookup(locales[DEFAULT_LANG], key);

      return text ? interpolate(text, vars) : key;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, locale: localeFor(lang) }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}

// Raw access to a locale, used by the first-login prompt: each language has to
// be labelled in that language, because the student may not read the current one
// yet.
export const messageIn = (lang: Lang, key: string): string =>
  lookup(locales[lang], key) ?? lookup(locales[DEFAULT_LANG], key) ?? key;

export {
  DEFAULT_LANG,
  LANGS,
  LANG_STORAGE_KEY,
  localeFor,
  readStoredLang,
  type Lang,
} from "./config";

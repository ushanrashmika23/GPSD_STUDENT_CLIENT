import { ChevronUp, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../ui/utils";
import { LANGS, messageIn, useI18n, type Lang } from "../../lib/i18n";

/**
 * Language selector — one component, two placements:
 *  · "sidebar"  desktop side nav, above the user/log-out row (opens upward)
 *  · "compact"  mobile top bar, next to the notification bell (opens downward)
 *
 * Each language is always labelled in its own script, so a student who cannot
 * read the current one can still find their own.
 */
export function LanguageSwitcher({
  variant = "sidebar",
  collapsed = false,
}: {
  variant?: "sidebar" | "compact";
  collapsed?: boolean;
}) {
  const { lang, setLang, t } = useI18n();
  const active = messageIn(lang, "language.nativeName");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "compact" ? (
          <button
            type="button"
            aria-label={t("language.label")}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Globe className="size-[18px]" />
            <span>{messageIn(lang, "language.short")}</span>
          </button>
        ) : (
          <button
            type="button"
            aria-label={t("language.label")}
            title={collapsed ? active : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border bg-background/60 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              collapsed ? "mx-auto size-9 justify-center px-0" : "mb-2 w-full px-3",
            )}
          >
            <Globe className="size-[18px] shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate">{active}</span>
                <ChevronUp className="ml-auto size-4 shrink-0 opacity-60" />
              </>
            )}
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={variant === "sidebar" ? "top" : "bottom"}
        align={variant === "sidebar" ? "start" : "end"}
        sideOffset={8}
        className="w-48 rounded-xl border-border p-1.5"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
          {t("language.label")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(next) => setLang(next as Lang)}
        >
          {LANGS.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              className="rounded-lg py-2"
            >
              {messageIn(code, "language.nativeName")}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Check, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { LANGS, messageIn, useI18n } from "../../lib/i18n";

/**
 * Asked once, right after the first login, then remembered in the browser
 * (localStorage "lang"). Both choices are written in their own script and the
 * heading is shown in both languages, so the question is readable whichever
 * language the student reads.
 */
export function LanguagePrompt({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) {
  const { lang, setLang, t } = useI18n();

  // One exit path for every way out (pick + Continue, the ✕, Esc, outside
  // click): the language in use is stored, so the prompt never asks again.
  const finish = () => {
    setLang(lang);
    onDone();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) finish();
      }}
    >
      <DialogContent className="gap-0 rounded-2xl border-border bg-card p-0 sm:max-w-md">
        <div className="p-6 sm:p-7">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
            <Globe className="size-[22px]" strokeWidth={2} />
          </div>

          <DialogTitle className="mt-5 font-display text-[1.35rem] leading-tight tracking-tight">
            {messageIn("en", "language.promptTitle")}
          </DialogTitle>
          <p className="mt-1 text-[1.05rem] leading-tight tracking-tight text-muted-foreground">
            {messageIn("si", "language.promptTitle")}
          </p>

          <DialogDescription className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
            {t("language.promptSubtitle")}
          </DialogDescription>

          <div className="mt-6 grid gap-2">
            {LANGS.map((code) => {
              const selected = code === lang;
              const native = messageIn(code, "language.nativeName");
              const english = messageIn(code, "language.englishLabel");
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary/30 bg-accent text-accent-foreground"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  <span className="flex-1 leading-tight">
                    <span className="block text-[0.975rem] tracking-tight">
                      {native}
                    </span>
                    {english !== native && (
                      <span className="block text-xs text-muted-foreground">
                        {english}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <Check className="size-4 shrink-0 text-primary" strokeWidth={2.4} />
                  )}
                </button>
              );
            })}
          </div>

          <Button onClick={finish} className="mt-6 h-11 w-full rounded-xl">
            {t("language.promptContinue")}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t("language.promptSaved")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

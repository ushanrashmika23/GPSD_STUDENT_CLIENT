import { UserX } from "lucide-react";
import { Button } from "../ui/button";
import { cardSurface } from "./surface";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

// Shown instead of every portal page when the backend's active-account
// middleware reports the student as deactivated (account or batch).
export function DeactivatedView({ onLogout }: { onLogout: () => void }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[70svh] items-center justify-center">
      <div
        className={cn(
          cardSurface,
          "flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center",
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <UserX className="size-7" />
        </div>
        <h1 className="text-xl tracking-tight">{t("deactivated.title")}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("deactivated.body")}
        </p>
        <Button variant="outline" onClick={onLogout} className="mt-2 rounded-xl">
          {t("common.logOut")}
        </Button>
      </div>
    </div>
  );
}

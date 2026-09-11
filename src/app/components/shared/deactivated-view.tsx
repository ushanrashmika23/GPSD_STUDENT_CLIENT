import { UserX } from "lucide-react";
import { Button } from "../ui/button";
import { cardSurface } from "./surface";
import { cn } from "../ui/utils";

// Shown instead of every portal page when the backend's active-account
// middleware reports the student as deactivated (account or batch).
export function DeactivatedView({ onLogout }: { onLogout: () => void }) {
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
        <h1 className="text-xl tracking-tight">Deactivated Student</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your student account has been deactivated by the institute. Please
          contact the institute office for more information.
        </p>
        <Button variant="outline" onClick={onLogout} className="mt-2 rounded-xl">
          Log out
        </Button>
      </div>
    </div>
  );
}

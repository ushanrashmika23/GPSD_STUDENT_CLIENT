import { cn } from "../ui/utils";
import { cardSurface } from "./surface";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-secondary",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className,
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className={cn(cardSurface, "p-5")}>
      <Shimmer className="size-9 rounded-xl" />
      <Shimmer className="mt-4 h-3 w-20" />
      <Shimmer className="mt-2 h-7 w-16" />
    </div>
  );
}

export function MaterialCardSkeleton() {
  return (
    <div className={cn(cardSurface, "p-5")}>
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-4 w-12" />
      </div>
      <Shimmer className="mt-4 h-5 w-3/4" />
      <Shimmer className="mt-2 h-3 w-full" />
      <Shimmer className="mt-1.5 h-3 w-5/6" />
      <Shimmer className="mt-5 h-9 w-full rounded-xl" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className={cn(cardSurface, "p-6")}>
      <Shimmer className="h-4 w-40" />
      <Shimmer className="mt-6 h-[240px] w-full rounded-xl" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className={cn(cardSurface, "flex items-center gap-4 p-5")}>
      <Shimmer className="size-10 rounded-xl" />
      <div className="flex-1">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="mt-2 h-3 w-1/4" />
      </div>
      <Shimmer className="h-6 w-12" />
    </div>
  );
}

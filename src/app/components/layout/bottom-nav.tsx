import { motion } from "motion/react";
import { cn } from "../ui/utils";
import { navItems, type PageKey } from "./nav";

export function BottomNav({
  active,
  onNavigate,
}: {
  active: PageKey;
  onNavigate: (key: PageKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.7rem] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
              <item.icon
                className="size-[22px]"
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Sigma } from "lucide-react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import type { PageKey } from "./nav";

export function AppShell({
  active,
  contentKey,
  onNavigate,
  onLogout,
  children,
}: {
  active: PageKey;
  contentKey: string;
  onNavigate: (key: PageKey) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-svh bg-background">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/85 px-5 py-3.5 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sigma className="size-[18px]" strokeWidth={2.2} />
          </div>
          <span className="font-display tracking-tight">AxiomMaths</span>
        </div>
        <button
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>
      </header>

      <main
        className={
          "transition-[padding] duration-300 ease-out " +
          (collapsed ? "lg:pl-20" : "lg:pl-[260px]")
        }
      >
        <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={contentKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav active={active} onNavigate={onNavigate} />
    </div>
  );
}

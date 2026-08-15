import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LogOut, PanelLeftClose, PanelLeftOpen, Sigma } from "lucide-react";
import { cn } from "../ui/utils";
import { navItems, type PageKey } from "./nav";
import { getStudentProfile, type StudentProfile } from "../../lib/api";

// The logged-in user stored at login (names/email…) — read synchronously so the
// sidebar fills instantly; the profile API adds the call-up number afterwards.
const storedUser = (): {
  first_name?: string;
  last_name?: string;
  email?: string;
} | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function Sidebar({
  active,
  onNavigate,
  onLogout,
  collapsed,
  onToggleCollapse,
}: {
  active: PageKey;
  onNavigate: (key: PageKey) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const stored = storedUser();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // GET /api/students/profile/:userId — fills the call-up number under the name
  useEffect(() => {
    getStudentProfile()
      .then(setProfile)
      .catch((e) => console.error("Sidebar profile fetch failed:", e));
  }, []);

  const firstName = stored?.first_name ?? profile?.user.first_name ?? "Student";
  const lastName = stored?.last_name ?? profile?.user.last_name ?? "";
  const email = stored?.email ?? profile?.user.email ?? "";
  // Call-up number once the profile resolves; email as the instant fallback
  const subline = profile?.call_up_no ?? email;

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-sidebar py-6 lg:flex"
    >
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          "flex items-center px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sigma className="size-5" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display tracking-tight text-foreground">
                AxiomMaths
              </p>
              <p className="text-xs text-muted-foreground">Combined Maths</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <PanelLeftClose className="size-[18px]" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="mx-auto mt-4 flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <PanelLeftOpen className="size-[18px]" />
        </button>
      )}

      {/* Nav */}
      <nav className="mt-6 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl py-2.5 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon
                className="relative z-10 size-[18px] shrink-0"
                strokeWidth={isActive ? 2.3 : 2}
              />
              {!collapsed && <span className="relative z-10">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer / user — real details from the login + profile API */}
      <div className="mt-auto px-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border border-border bg-background/60 py-2.5",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm text-primary">
            {firstName[0] ?? ""}
            {lastName[0] ?? ""}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm text-foreground">
                  {firstName} {lastName}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {subline}
                </p>
              </div>
              <button
                onClick={onLogout}
                aria-label="Log out"
                className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

import { LayoutDashboard, FolderOpen, TrendingUp, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PageKey = "dashboard" | "materials" | "performance" | "profile";

export interface NavItem {
  key: PageKey;
  /** i18n key resolved with t() where the item is rendered */
  labelKey: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { key: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { key: "materials", labelKey: "nav.materials", icon: FolderOpen },
  { key: "performance", labelKey: "nav.performance", icon: TrendingUp },
  { key: "profile", labelKey: "nav.profile", icon: User },
];

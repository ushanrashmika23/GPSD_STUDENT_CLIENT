import { LayoutDashboard, FolderOpen, TrendingUp, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PageKey = "dashboard" | "materials" | "performance" | "profile";

export interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "materials", label: "Materials", icon: FolderOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "profile", label: "Profile", icon: User },
];

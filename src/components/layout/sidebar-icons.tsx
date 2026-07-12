"use client";

import {
  HomeIcon,
  MailIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  type LucideIcon,
} from "lucide-react";
import type { SidebarIconName } from "@/components/layout/SideBarMenuItems";

const sidebarIconMap: Record<SidebarIconName, LucideIcon> = {
  home: HomeIcon,
  "shopping-bag": ShoppingBagIcon,
  package: PackageIcon,
  "user-circle": UserCircleIcon,
  mail: MailIcon,
};

type SidebarIconProps = {
  name: SidebarIconName;
  className?: string;
};

export function SidebarIcon({ name, className }: SidebarIconProps) {
  const Icon = sidebarIconMap[name];
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}

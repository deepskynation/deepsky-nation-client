"use client";

import {
  ClipboardListIcon,
  HomeIcon,
  MailIcon,
  PackageIcon,
  PaletteIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  type LucideIcon,
} from "lucide-react";
import type { SidebarIconName } from "@/components/layout/SideBarMenuItems";

const sidebarIconMap: Record<SidebarIconName, LucideIcon> = {
  home: HomeIcon,
  "shopping-bag": ShoppingBagIcon,
  "shopping-cart": ShoppingCartIcon,
  package: PackageIcon,
  "user-circle": UserCircleIcon,
  mail: MailIcon,
  audit: ClipboardListIcon,
  "model-artist": PaletteIcon,
};

type SidebarIconProps = {
  name: SidebarIconName;
  className?: string;
};

export function SidebarIcon({ name, className }: SidebarIconProps) {
  const Icon = sidebarIconMap[name];
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}

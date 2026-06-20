import {
  UserCircleIcon,
  HomeIcon,
  ContactIcon,
  RulerIcon,
  PackageIcon,
} from "lucide-react";

export type MenuItemTypes = {
  id: string;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: MenuItemTypes[];
  variant?: string;
  chipColor?: string;
  subtitle?: string;
  badge?: number | string;
  hideInDesktopNav?: boolean;
};

export const dashboardHeaderMenuItems: MenuItemTypes[] = [
  {
    id: "dashboard",
    title: "Home",
    icon: HomeIcon,
    href: "/",
  },

  {
    id: "size-chart",
    title: "Size Chart",
    icon: RulerIcon,
    href: "/size-chart",
  },

  {
    id: "about-us",
    title: "About Us",
    icon: UserCircleIcon,
    href: "/about-us",
  },
  // {
  //   id: "contact-us",
  //   title: "Contact Us",
  //   icon: ContactIcon,
  //   href: "/#contact-us",
  // },
];

export const userHeaderMenuItems: MenuItemTypes[] = [
  {
    id: "dashboard",
    title: "Home",
    icon: HomeIcon,
    href: "/dashboard",
  },
  {
    id: "orders",
    title: "Orders",
    icon: PackageIcon,
    href: "/orders",
    hideInDesktopNav: true,
  },
  {
    id: "size-chart",
    title: "Size Chart",
    icon: RulerIcon,
    href: "/size-chart",
  },
  {
    id: "about-us",
    title: "About Us",
    icon: UserCircleIcon,
    href: "/about-us",
  },
  // {
  //     id: "profile",
  //     title: "Profile",
  //     icon: UserCircleIcon,
  //     href: "/profile",
  // },
];

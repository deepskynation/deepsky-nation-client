import {
  UserCircleIcon,
  HomeIcon,
  ShoppingBagIcon,
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
};

export const dashboardHeaderMenuItems: MenuItemTypes[] = [
  {
    id: "dashboard",
    title: "Home",
    icon: HomeIcon,
    href: "/",
  },
  {
    id: "products",
    title: "Products",
    icon: ShoppingBagIcon,
    href: "/#products",
  },
  {
    id: "about-us",
    title: "About Us",
    icon: UserCircleIcon,
    href: "/#about-us",
  },
  {
    id: "contact-us",
    title: "Contact Us",
    icon: ContactIcon,
    href: "/#contact-us",
  },
];

export const userHeaderMenuItems: MenuItemTypes[] = [
  {
    id: "dashboard",
    title: "Home",
    icon: HomeIcon,
    href: "/user/dashboard",
  },
  {
    id: "products",
    title: "Products",
    icon: ShoppingBagIcon,
    href: "/user/products",
  },
  {
    id: "orders",
    title: "Orders",
    icon: PackageIcon,
    href: "/user/orders",
  },
  {
    id: "size-chart",
    title: "Size Chart",
    icon: RulerIcon,
    href: "/user/size-chart",
  },
  {
    id: "about-us",
    title: "About Us",
    icon: UserCircleIcon,
    href: "/user/about-us",
  },
  // {
  //     id: "profile",
  //     title: "Profile",
  //     icon: UserCircleIcon,
  //     href: "/user/profile",
  // },
];

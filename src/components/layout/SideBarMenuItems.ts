export const sidebarIconNames = [
  "home",
  "shopping-bag",
  "shopping-cart",
  "package",
  "user-circle",
  "audit",
  "model-artist",
] as const;

export type SidebarIconName = (typeof sidebarIconNames)[number];

export type MenuItemTypes = {
  id: string;
  title: string;
  icon: SidebarIconName;
  href: string;
  badge?: number | string;
  showChevron?: boolean;
};

export type SidebarMenuSection = {
  id: string;
  label: string;
  items: MenuItemTypes[];
};

export type SidebarConfig = {
  productTitle: string;
  sections: SidebarMenuSection[];
};

export const adminSidebarConfig: SidebarConfig = {
  productTitle: "DeepSky",
  sections: [
    {
      id: "manage",
      label: "Manage",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: "home",
          href: "/admin/dashboard",
        },
        {
          id: "products",
          title: "Products",
          icon: "shopping-bag",
          href: "/admin/products",
        },
        
        {
          id: "orders",
          title: "Orders",
          icon: "package",
          href: "/admin/orders",
        },
        {
          id: "users",
          title: "Users",
          icon: "user-circle",
          href: "/admin/users",
        },
      ],
    },
    {
      id: "others",
      label: "Others",
      items: [
        {
          id: "profile",
          title: "Profile",
          icon: "user-circle",
          href: "/admin/profile",
        },
        {
          id: "audit",
          title: "Audit",
          icon: "audit",
          href: "/admin/audit",
        },
      ],
    },
  ],
};


export const userSidebarConfig: SidebarConfig = {
  productTitle: "DeepSky",
  sections: [
    {
      id: "shop",
      label: "Shop",
      items: [
        {
          id: "dashboard",
          title: "Home",
          icon: "home",
          href: "/user/dashboard",
        },
        {
          id: "products",
          title: "Products",
          icon: "shopping-bag",
          href: "/user/products",
        },
        {
          id: "cart",
          title: "Cart",
          icon: "shopping-cart",
          href: "/user/cart",
        },
        {
          id: "orders",
          title: "Orders",
          icon: "package",
          href: "/user/orders",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        {
          id: "size-chart",
          title: "Size Chart",
          icon: "model-artist",
          href: "/user/size-chart",
        },
        {
          id: "about-us",
          title: "About Us",
          icon: "user-circle",
          href: "/user/about-us",
        },
        {
          id: "profile",
          title: "Profile",
          icon: "user-circle",
          href: "/user/profile",
        },
      ],
    },
  ],
};


/** @deprecated Use adminSidebarConfig.sections flat items if needed */
export const adminSideBarMenuItems = adminSidebarConfig.sections.flatMap(
  (s) => s.items,
);

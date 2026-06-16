"use client";

import { useMemo } from "react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { userSidebarConfig } from "@/components/layout/SideBarMenuItems";
import { useAppSelector } from "@/hooks";
import { selectCartItemCount } from "@/store/slices/cartSlice";

type UserSidebarLayoutProps = {
  children: React.ReactNode;
};

export function UserSidebarLayout({ children }: UserSidebarLayoutProps) {
  const cartCount = useAppSelector(selectCartItemCount);

  const config = useMemo(() => {
    const badge = cartCount > 0 ? cartCount : undefined;
    return {
      ...userSidebarConfig,
      sections: userSidebarConfig.sections.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.id === "cart" ? { ...item, badge } : item,
        ),
      })),
    };
  }, [cartCount]);

  return (
    <SidebarLayout config={config} brandHref="/dashboard">
      {children}
    </SidebarLayout>
  );
}

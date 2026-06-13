import { ToastProvider } from "@/components/common/feedback/toast-provider";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { RoleRouteGuard } from "@/components/layout/role-route-guard";
import { adminSidebarConfig } from "@/components/layout/SideBarMenuItems";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleRouteGuard allowedRoles={["admin"]}>
      <SidebarLayout config={adminSidebarConfig} brandHref="/admin/dashboard">
        <ToastProvider>{children}</ToastProvider>
      </SidebarLayout>
    </RoleRouteGuard>
  );
}

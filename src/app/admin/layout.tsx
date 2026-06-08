import { AdminToastShell } from "@/components/admin/admin-toast-shell";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { adminSidebarConfig } from "@/components/layout/SideBarMenuItems";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarLayout config={adminSidebarConfig} brandHref="/admin/dashboard">
      <AdminToastShell>{children}</AdminToastShell>
    </SidebarLayout>
  );
}

import { UserHeaderLayout } from "@/components/layout/user-header-layout";
import { RoleRouteGuard } from "@/components/layout/role-route-guard";
import { UserToastShell } from "@/components/user/user-toast-shell";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleRouteGuard allowedRoles={["user"]} allowGuest>
      <UserHeaderLayout>
        <UserToastShell>{children}</UserToastShell>
      </UserHeaderLayout>
    </RoleRouteGuard>
  );
}

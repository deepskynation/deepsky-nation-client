import { UserHeaderLayout } from "@/components/layout/user-header-layout";
import { UserToastShell } from "@/components/user/user-toast-shell";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserHeaderLayout>
      <UserToastShell>{children}</UserToastShell>
    </UserHeaderLayout>
  );
}

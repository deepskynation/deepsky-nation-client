import type { MenuItemTypes } from "@/components/layout/HeaderMenuItems";
import { HeaderNavLink } from "@/components/layout/header-nav-link";
import { cn } from "@/lib/utils";

type HeaderMenuDropdownProps = {
  item: MenuItemTypes;
  triggerClassName?: string;
  menuClassName?: string;
  iconClassName?: string;
};

export function HeaderMenuDropdown({
  item,
  triggerClassName,
  menuClassName,
  iconClassName = "size-6",
}: HeaderMenuDropdownProps) {
  const Icon = item.icon;

  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          "flex items-center rounded-md p-2 hover:bg-muted",
          triggerClassName,
        )}
        aria-label={item.title ?? item.id}
      >
        {Icon ? <Icon className={iconClassName} /> : null}
      </button>
      <div
        className={cn(
          "invisible absolute right-0 top-full z-10 mt-1 min-w-40 rounded-md border bg-background p-1 opacity-0 shadow-md",
          "group-focus-within:visible group-focus-within:opacity-100",
          "group-hover:visible group-hover:opacity-100",
          menuClassName,
        )}
      >
        {item.children?.map((child) => (
          <HeaderNavLink key={child.id} item={child} />
        ))}
      </div>
    </div>
  );
}

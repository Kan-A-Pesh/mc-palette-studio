import { OrganizationSwitcher } from "@/app/(application)/_components/organization-switcher";
import { cn } from "@repo/ui/utils/cn";

export function SidebarHeader({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn("lg:p-3", {
        "lg:px-2": collapsed,
      })}
    >
      <OrganizationSwitcher
        className={cn("transition-all duration-200 ease-out", {
          "w-16": collapsed,
        })}
      />
    </div>
  );
}

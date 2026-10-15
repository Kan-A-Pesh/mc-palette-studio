import * as Divider from "@repo/ui/divider";
import { cn } from "@repo/ui/utils/cn";

export function SidebarDivider({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-5">
      <Divider.Root
        className={cn("transition-all duration-200 ease-out", {
          "w-10": collapsed,
        })}
      />
    </div>
  );
}

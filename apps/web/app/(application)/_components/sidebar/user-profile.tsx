import { UserButton } from "@/app/(application)/_components/user-button";
import { cn } from "@repo/ui/utils/cn";

export function UserProfile({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn("p-3", {
        "px-2": collapsed,
      })}
    >
      <UserButton
        className={cn("transition-all duration-200 ease-out", {
          "w-auto": collapsed,
        })}
      />
    </div>
  );
}

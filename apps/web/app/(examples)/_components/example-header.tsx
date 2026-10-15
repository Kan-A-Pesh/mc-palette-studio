import { cn } from "@repo/ui/utils/cn";

interface ExampleHeaderProps {
  title: string;
  description: string;
  currentUserName: string;
  isConnected: boolean;
}

export function ExampleHeader({
  title,
  description,
  currentUserName,
  isConnected,
}: ExampleHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-neutral-400">{description}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
          <p className="text-sm text-neutral-500">
            You are: <span className="text-white">{currentUserName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500",
            )}
          />
          <span className="text-sm text-neutral-400">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </header>
  );
}

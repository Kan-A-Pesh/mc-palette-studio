export function SessionSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
      <div className="flex size-10 items-center justify-center rounded-full bg-faded-lighter" />
      <div className="flex-1 space-y-1">
        <div className="h-4 w-24 rounded bg-faded-lighter" />
        <div className="h-3 w-32 rounded bg-faded-lighter" />
      </div>
    </div>
  );
}

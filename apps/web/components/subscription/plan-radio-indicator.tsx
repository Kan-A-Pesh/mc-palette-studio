import { cn } from "@repo/ui/utils/cn";

export default function PlanRadioIndicator({
  planId,
  selected,
}: {
  planId: string;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "group/radio relative size-5 shrink-0",
        selected ? "data-[state=checked]" : "",
      )}
    >
      <svg
        className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
        fill="none"
        height="20"
        viewBox="0 0 20 20"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Radio button selection indicator</title>
        <circle
          className={cn(
            "fill-bg-soft-200 transition duration-200 ease-out",
            "group-hover/radio:fill-bg-sub-300",
            selected && "fill-bg-white-0",
          )}
          cx="10"
          cy="10"
          r="8"
        />
        <g filter={`url(#plan-radio-filter-${planId})`}>
          <circle className="fill-bg-white-0" cx="10" cy="10" r="6.5" />
        </g>
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="17"
            id={`plan-radio-filter-${planId}`}
            width="17"
            x="1.5"
            y="3.5"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.105882 0 0 0 0 0.109804 0 0 0 0 0.113725 0 0 0 0.12 0"
            />
            <feBlend
              in2="BackgroundImageFix"
              mode="normal"
              result="effect1_dropShadow"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow"
              mode="normal"
              result="shape"
            />
          </filter>
        </defs>
      </svg>

      {selected && (
        <svg
          className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
          fill="none"
          height="20"
          viewBox="0 0 20 20"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Radio button active selection</title>
          <circle
            className="stroke-primary-base transition duration-200 ease-out"
            cx="10"
            cy="10"
            r="6"
            strokeWidth="4"
          />
        </svg>
      )}
    </div>
  );
}

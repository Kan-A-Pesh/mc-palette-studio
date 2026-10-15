import { RiCloseLine, RiSearch2Line } from "@remixicon/react";
import isEqual from "fast-deep-equal";
import { memo } from "react";

import { StaggeredFadeLoader } from "@/ui/custom/staggered-fade-loader";
import * as Input from "@/ui/input";

const SearchLoader = memo(
  () => (
    <div className="flex size-5 shrink-0 select-none items-center justify-center">
      <StaggeredFadeLoader spacing="tight" variant="muted" />
    </div>
  ),
  () => true,
);

SearchLoader.displayName = "SearchLoader";

const SearchIcon = memo(
  ({ isSearching }: { isSearching: boolean }) => {
    if (isSearching) {
      return <SearchLoader />;
    }
    return <Input.Icon as={RiSearch2Line} />;
  },
  (prev, next) => prev.isSearching === next.isSearching,
);

SearchIcon.displayName = "SearchIcon";

interface SearchInputProps {
  value: string;
  isSearching: boolean;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  className?: string;
  size?: "medium" | "small" | "xsmall";
}

const SearchInput = memo(
  ({
    value,
    isSearching,
    placeholder,
    onChange,
    onClear,
    className,
    size = "medium",
  }: SearchInputProps) => {
    return (
      <Input.Root className={className} size={size}>
        <Input.Wrapper>
          <SearchIcon isSearching={isSearching} />
          <Input.Input
            onChange={onChange}
            placeholder={placeholder}
            value={value}
          />
          {value && (
            <Input.Icon
              as="button"
              className="cursor-pointer hover:text-text-strong-950"
              onClick={onClear}
              type="button"
            >
              <RiCloseLine className="size-5" />
            </Input.Icon>
          )}
        </Input.Wrapper>
      </Input.Root>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);

SearchInput.displayName = "SearchInput";

export { SearchIcon, SearchInput, SearchLoader };

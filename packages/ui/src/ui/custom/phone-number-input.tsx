"use client";

import * as PopoverPrimitives from "@radix-ui/react-popover";
import {
  RiArrowDownSLine,
  RiGlobalLine,
  RiSearch2Line,
} from "@remixicon/react";
import { Command } from "cmdk";
import parsePhoneNumberFromString, {
  type CountryCode,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import React from "react";

import * as Divider from "@/ui/divider";
import * as Input from "@/ui/input";
import { selectVariants } from "@/ui/select";
import { selectedCountries } from "@/utils/countries/selected-countries";
import countryNames from "@/utils/countries/country-names.json" with { type: "json" };
import { cn } from "@/utils/cn";

// Import metadata for example phone numbers

// Regex constants defined at top level for performance
const US_PHONE_PREFIX_REGEX = /^\+1/;

const countriesWithPhoneAndName = selectedCountries.reduce(
  (acc, code) => {
    acc[code] = {
      phoneCode: getCountryCallingCode(code),
      countryName: countryNames[code],
    };
    return acc;
  },
  {} as Record<CountryCode, { phoneCode: string; countryName: string }>,
);

interface PhoneNumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange"
  > {
  inputId?: string;
  value?: string;
  onChange?: (
    value: string,
    isValid: boolean,
    internationalValue?: string,
  ) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  hasError?: boolean;
}

const safeParsePhoneNumber = (value: string) => {
  if (!value) {
    return {
      countryCode: "US" as CountryCode,
      phoneCode: "1",
      nationalNumber: "",
    };
  }

  // Handle international format with + prefix
  if (value.includes("+")) {
    // Get the part after the last + sign
    const normalizedValue = value.slice(value.lastIndexOf("+"));

    // Find matching country code
    const matchingCountry = Object.entries(countriesWithPhoneAndName).find(
      ([_, { phoneCode }]) => normalizedValue.slice(1).startsWith(phoneCode),
    );

    if (matchingCountry) {
      const [countryCode, { phoneCode }] = matchingCountry;
      return {
        countryCode: countryCode as CountryCode,
        phoneCode,
        nationalNumber: normalizedValue.slice(phoneCode.length + 1),
      };
    }
  }

  // Default to US if no match
  return {
    countryCode: "US" as CountryCode,
    phoneCode: "1",
    nationalNumber: value.replace(US_PHONE_PREFIX_REGEX, ""),
  };
};

const getInternationalFormat = ({
  countryCode,
  phoneCode,
  nationalNumber,
}: {
  countryCode: CountryCode;
  phoneCode?: string;
  nationalNumber: string;
}) => {
  const fullNumber =
    phoneCode ||
    `+${countriesWithPhoneAndName[countryCode].phoneCode}${nationalNumber}`;
  const phoneNumber = parsePhoneNumberFromString(fullNumber, countryCode);
  return phoneNumber?.format("E.164") || fullNumber;
};

export const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(
  (
    {
      inputId,
      className,
      value = "",
      onChange,
      onBlur,
      hasError = false,
      ...props
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = React.useState(
      safeParsePhoneNumber(value),
    );

    const [open, setOpen] = React.useState(false);
    const [isValid, setIsValid] = React.useState(true);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const exampleNumber = getExampleNumber(localValue.countryCode, examples);

    // Handle ref forwarding manually to avoid type issues
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const { triggerRoot, triggerIcon, triggerArrow } = selectVariants({
      variant: "compactForInput",
    });

    // Initialize the input with the provided value
    React.useEffect(() => {
      setLocalValue(safeParsePhoneNumber(value));
    }, [value]);

    // Validate phone number based on country code
    const validateNumber = (input: string) => {
      if (!input) {
        setIsValid(true);
        return true;
      }

      // Construct full number with country code for validation
      const valid = isValidPhoneNumber(input);
      setIsValid(valid);
      return valid;
    };

    // Format number as you type
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nationalNumber = e.target.value;

      const parsed = safeParsePhoneNumber(
        `+${localValue.phoneCode}${nationalNumber}`,
      );

      const fullNumber = `+${parsed.phoneCode}${parsed.nationalNumber}`;
      const isValidInput = validateNumber(fullNumber);

      const internationalFormat = getInternationalFormat(parsed);

      setLocalValue(parsed);

      if (onChange) {
        onChange(fullNumber, isValidInput, internationalFormat);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleCountryChange = (newCountryCode: CountryCode) => {
      const fullNumber = `+${countriesWithPhoneAndName[newCountryCode].phoneCode}${localValue.nationalNumber}`;
      const parsed = safeParsePhoneNumber(fullNumber);

      const valid = validateNumber(fullNumber);

      setLocalValue(parsed);

      if (onChange) {
        onChange(fullNumber, valid, fullNumber);
      }

      setOpen(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    };

    return (
      <div className={className}>
        <PopoverPrimitives.Root modal onOpenChange={setOpen} open={open}>
          <PopoverPrimitives.Anchor>
            <Input.Root hasError={hasError || !isValid}>
              <PopoverPrimitives.Trigger className={triggerRoot()}>
                {localValue.countryCode ? (
                  <>
                    <img
                      alt=""
                      className={triggerIcon()}
                      src={`/flags/${localValue.countryCode}.svg`}
                    />
                    {`+${localValue.phoneCode}`}
                  </>
                ) : (
                  <RiGlobalLine className={triggerIcon()} />
                )}
                <RiArrowDownSLine className={triggerArrow()} />
              </PopoverPrimitives.Trigger>

              <Input.Wrapper>
                <Input.Input
                  id={inputId}
                  onBlur={handleBlur}
                  onChange={handleInputChange}
                  placeholder={exampleNumber?.formatNational()}
                  ref={inputRef}
                  type="tel"
                  value={localValue.nationalNumber}
                  {...props}
                />
              </Input.Wrapper>
            </Input.Root>
          </PopoverPrimitives.Anchor>
          <PopoverPrimitives.Portal>
            <PopoverPrimitives.Content
              className={cn(
                // base
                "relative z-50 overflow-hidden rounded-2xl bg-bg-white-0 shadow-regular-md ring-1 ring-stroke-soft-200 ring-inset",
                // widths
                "min-w-[--radix-popper-anchor-width]",
                // animation
                "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              )}
              collisionPadding={10}
              onCloseAutoFocus={(e) => e.preventDefault()}
              sideOffset={10}
            >
              <Command
                filter={(filterValue, search, keywords) => {
                  const extendValue = `${filterValue} ${keywords?.join(" ")}`;
                  if (
                    extendValue
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                  ) {
                    return 1;
                  }
                  return 0;
                }}
              >
                <div className="flex items-center gap-2 px-4 pt-2">
                  <RiSearch2Line className="size-5 text-text-soft-400" />
                  <Command.Input
                    className="h-9 w-full bg-transparent text-paragraph-sm outline-none placeholder:text-text-soft-400"
                    placeholder="Search..."
                  />
                </div>
                <div className="my-1 px-2">
                  <Divider.Root variant="line-spacing" />
                </div>
                <Command.List className="max-h-[188px] overflow-auto p-2 pt-0">
                  <Command.Empty className="flex flex-col items-center justify-center py-6 text-center">
                    <RiGlobalLine className="mb-2 size-8 text-text-soft-400" />
                    <p className="font-medium text-paragraph-sm text-text-strong-950">
                      No country found
                    </p>
                    <p className="text-paragraph-xs text-text-soft-400">
                      Try searching by country name or phone code
                    </p>
                  </Command.Empty>
                  {Object.entries(countriesWithPhoneAndName)
                    .sort(([_aCode, aCountryData], [_bCode, bCountryData]) =>
                      aCountryData.countryName.localeCompare(
                        bCountryData.countryName,
                      ),
                    )
                    .map(([countryCode, countryData]) => (
                      <Command.Item
                        className={cn(
                          // base
                          "group cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950",
                          "flex items-center gap-2",
                          // disabled
                          "data-[disabled=true]:pointer-events-none data-[disabled=true]:text-text-disabled-300",
                          // hover, focus
                          "data-[selected=true]:bg-bg-weak-50 data-[selected]:outline-0",
                        )}
                        key={countryCode}
                        keywords={[
                          countryData.countryName,
                          countryData.phoneCode,
                        ]}
                        onSelect={(currentValue) => {
                          handleCountryChange(currentValue as CountryCode);
                        }}
                        value={countryCode}
                      >
                        <div className="flex items-center gap-1.5">
                          <img
                            alt=""
                            className="size-5 shrink-0 rounded-full"
                            src={`/flags/${countryCode}.svg`}
                          />
                          <span className="group-has-[&]/trigger:hidden">
                            {countryData.countryName}
                          </span>
                          <span>
                            <span className="group-has-[&]/trigger:hidden">
                              {"("}
                            </span>
                            <span>{`+${countryData.phoneCode}`}</span>
                            <span className="group-has-[&]/trigger:hidden">
                              {")"}
                            </span>
                          </span>
                        </div>
                      </Command.Item>
                    ))}
                </Command.List>
              </Command>
            </PopoverPrimitives.Content>
          </PopoverPrimitives.Portal>
        </PopoverPrimitives.Root>
      </div>
    );
  },
);

PhoneNumberInput.displayName = "PhoneNumberInput";

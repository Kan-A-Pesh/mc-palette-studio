"use client";

import { useId, useState } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { FormField } from "@/ui/form";
import * as Input from "@/ui/input";
import * as Tag from "@/ui/tag";

interface FormTagInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "medium" | "small" | "xsmall";
}

export function FormTagInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  required,
  description,
  placeholder = "Add tags...",
  disabled,
  size,
  ...controllerProps
}: FormTagInputProps<TFieldValues, TName>) {
  const uniqueId = useId();
  const [inputValue, setInputValue] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      {...controllerProps}
      render={({ field, fieldState }) => {
        const tags: string[] = Array.isArray(field.value) ? field.value : [];

        const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key !== "Enter") {
            return;
          }
          e.preventDefault();

          const next = inputValue.trim();
          if (!next) {
            return;
          }
          if (tags.includes(next)) {
            setInputValue("");
            return;
          }
          field.onChange([...tags, next]);
          setInputValue("");
        };

        const removeTag = (tag: string) => {
          field.onChange(tags.filter((t) => t !== tag));
        };

        return (
          <FormField
            description={description}
            error={fieldState.error}
            label={label}
            name={uniqueId}
            required={required}
          >
            <Input.Root hasError={!!fieldState.error} size={size}>
              <Input.Wrapper>
                <Input.Input
                  disabled={disabled}
                  id={uniqueId}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={placeholder}
                  value={inputValue}
                />
              </Input.Wrapper>
            </Input.Root>

            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag.Root key={tag}>
                    {tag}
                    <Tag.DismissButton onClick={() => removeTag(tag)} />
                  </Tag.Root>
                ))}
              </div>
            )}
          </FormField>
        );
      }}
    />
  );
}

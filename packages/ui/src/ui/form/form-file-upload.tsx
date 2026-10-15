"use client";

import {
  RiDeleteBinLine,
  RiFileLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { upload } from "@vercel/blob/client";
import { useCallback, useId, useState } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { ulid } from "ulid";
import { FormField } from "./form-field";
import { StaggeredFadeLoader } from "@/ui/custom/staggered-fade-loader";
import * as Button from "@/ui/button";
import * as FileUpload from "@/ui/file-upload";
import { toast } from "@/ui/toast";
import { cn } from "@/utils/cn";

interface FormFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  uploadPath: string;
  uploadPrefix?: string;
  acceptedTypes?: string[];
  maxSize?: number;
  onUploadSuccess?: (url: string) => Promise<void> | void;
  onRemoveSuccess?: (url: string) => Promise<void> | void;
  onUploadStart?: () => void;
  onRemoveStart?: () => void;
}

const getFileName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split("/").pop() || "file";
  } catch {
    return "file";
  }
};

const validateFileType = (file: File, acceptedTypes: string[]): boolean => {
  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.includes("*")) {
      const [type, subtype] = acceptedType.split("/");
      const [fileType, fileSubtype] = file.type.split("/");
      return type === fileType && (subtype === "*" || subtype === fileSubtype);
    }
    return acceptedType === file.type;
  });
};

const formatAcceptedTypes = (acceptedTypes: string[]): string => {
  if (acceptedTypes.includes("*/*")) {
    return "allFileTypes";
  }
  return acceptedTypes
    .map((type) => type.split("/")[1]?.toUpperCase() || type)
    .join(", ");
};

export function FormFileUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  required,
  description,
  placeholder = "Choose a file or drag & drop it here",
  uploadPath,
  uploadPrefix,
  acceptedTypes = ["*/*"],
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadSuccess,
  onRemoveSuccess,
  onUploadStart,
  onRemoveStart,
  ...controllerProps
}: FormFileUploadProps<TFieldValues, TName>) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputId = useId();

  const handleUpload = useCallback(
    async (file: File, onChange: (value: string) => void) => {
      // File size validation
      if (file.size > maxSize) {
        toast.error(
          `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
        );
        return;
      }

      // File type validation
      if (!validateFileType(file, acceptedTypes)) {
        toast.error("File type not supported");
        return;
      }

      setIsUploading(true);
      onUploadStart?.();

      try {
        const extension = file.name.split(".").pop() || "txt";
        const filename = `${uploadPrefix || "uploads"}/${ulid()}.${extension}`;
        const { url } = await upload(filename, file, {
          access: "public",
          handleUploadUrl: uploadPath,
        });

        onChange(url);
        await onUploadSuccess?.(url);

        if (!onUploadSuccess) {
          toast.success("File uploaded successfully");
        }
      } catch {
        toast.error("Failed to upload file");
        onChange("");
      } finally {
        setIsUploading(false);
      }
    },
    [
      maxSize,
      acceptedTypes,
      uploadPath,
      onUploadSuccess,
      onUploadStart,
      uploadPrefix,
    ],
  );

  const handleFileSelect = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      onChange: (value: string) => void,
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        handleUpload(file, onChange);
      }
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (
      event: React.DragEvent<HTMLElement>,
      onChange: (value: string) => void,
    ) => {
      event.preventDefault();
      setDragActive(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file, onChange);
      }
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  const handleRemove = useCallback(
    async (
      currentUrl: string,
      onChange: (value: string) => void,
      event: React.MouseEvent,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (!currentUrl) {
        onChange("");
        return;
      }

      setIsRemoving(true);
      onRemoveStart?.();

      try {
        await onRemoveSuccess?.(currentUrl);
        onChange("");
        if (!onRemoveSuccess) {
          toast.success("File removed successfully");
        }
      } catch {
        toast.error("Failed to remove file");
      } finally {
        setIsRemoving(false);
      }
    },
    [onRemoveSuccess, onRemoveStart],
  );

  const renderUploadedFile = (
    fileValue: string,
    onFileChange: (value: string) => void,
  ) => (
    <div className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0">
        <RiFileLine className="size-5 text-text-sub-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-label-sm text-text-strong-950">
          {getFileName(fileValue)}
        </div>
        <div className="text-paragraph-xs text-text-sub-600">
          File uploaded successfully
        </div>
      </div>
      <Button.Root
        disabled={isUploading || isRemoving}
        mode="stroke"
        onClick={(e) => handleRemove(fileValue, onFileChange, e)}
        size="xsmall"
        type="button"
        variant="neutral"
      >
        {isRemoving ? (
          <StaggeredFadeLoader size="small" variant="muted" />
        ) : (
          <Button.Icon as={RiDeleteBinLine} />
        )}
        {isRemoving ? "Removing..." : "Remove"}
      </Button.Root>
    </div>
  );

  // Render upload zone
  const renderUploadZone = (
    onValueChange: (value: string) => void,
    fieldError?: { message?: string },
  ) => (
    <FileUpload.Root
      className={cn(
        "cursor-pointer transition-colors",
        dragActive && "border-primary-base bg-primary-base/5",
        isUploading && "pointer-events-none opacity-75",
        fieldError && "border-error-base",
      )}
      htmlFor={fileInputId}
      isDragActive={dragActive}
      onDragLeave={(e) => handleDragLeave(e)}
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e, onValueChange)}
    >
      <input
        accept={acceptedTypes.join(",")}
        className="sr-only"
        disabled={isUploading}
        id={fileInputId}
        onChange={(e) => handleFileSelect(e, onValueChange)}
        type="file"
      />

      {isUploading ? (
        <div className="flex size-6 items-center justify-center">
          <StaggeredFadeLoader variant="muted" />
        </div>
      ) : (
        <FileUpload.Icon
          as={RiUploadCloud2Line}
          className={cn("transition-colors", dragActive && "text-primary-base")}
        />
      )}

      <div className="space-y-1.5">
        <div className="text-label-sm text-text-strong-950">
          {isUploading ? "Uploading..." : placeholder}
        </div>
        <div className="text-paragraph-xs text-text-sub-600">
          {acceptedTypes.includes("*/*")
            ? "All file types"
            : formatAcceptedTypes(acceptedTypes)}{" "}
          up to {Math.round(maxSize / 1024 / 1024)}
          MB
        </div>
      </div>

      {!isUploading && (
        <FileUpload.Button>
          <FileUpload.Icon as={RiFileLine} />
          Browse Files
        </FileUpload.Button>
      )}
    </FileUpload.Root>
  );

  return (
    <Controller
      control={control}
      name={name}
      {...controllerProps}
      render={({ field, fieldState }) => (
        <FormField
          description={description}
          error={fieldState.error}
          label={label}
          name={name}
          required={required}
        >
          <div className="space-y-4">
            {field.value
              ? renderUploadedFile(field.value, field.onChange)
              : renderUploadZone(field.onChange, fieldState.error)}
          </div>
        </FormField>
      )}
    />
  );
}

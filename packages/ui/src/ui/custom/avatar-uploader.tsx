"use client";

import type { RemixiconComponentType } from "@remixicon/react";
import { useCallback, useEffect, useState } from "react";
import type { Area } from "react-easy-crop";
import { ulid } from "ulid";
import { cn } from "@/utils/cn";
import * as Avatar from "@/ui/avatar";
import * as Button from "@/ui/button";
import * as Modal from "@/ui/modal";
import { ImageCropper } from "./image-cropper";
import { ImageDropzone } from "./image-dropzone";
import { StaggeredFadeLoader } from "./staggered-fade-loader";

export type AvatarSize =
  | "20"
  | "24"
  | "32"
  | "40"
  | "48"
  | "56"
  | "64"
  | "72"
  | "80";

export interface AvatarUploaderProps {
  entityName: string;
  currentAvatar?: string | null;
  onAvatarChange: (avatarUrl: string) => void;
  size?: AvatarSize;
  className?: string;
  icon: RemixiconComponentType;
  uploadUrl: string;
  filePathPrefix: string;
  placeholderType?: "user" | "company";
  modalTitle: string;
  uploadFile: (
    filename: string,
    file: File,
    options: { access: "public"; handleUploadUrl: string },
  ) => Promise<{ url: string }>;
}

export function AvatarUploader({
  entityName,
  currentAvatar,
  onAvatarChange,
  size = "64",
  className,
  icon,
  uploadUrl,
  filePathPrefix,
  placeholderType = "user",
  modalTitle,
  uploadFile,
}: AvatarUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
  const [previousAvatar, setPreviousAvatar] = useState<
    string | null | undefined
  >(null);

  useEffect(() => {
    if (previousAvatar !== currentAvatar) {
      setIsAvatarUpdating(false);
    }
    setPreviousAvatar(currentAvatar);
  }, [currentAvatar, previousAvatar]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  }, []);

  const handleCropComplete = useCallback((croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setCroppedAreaPixels(null);
  }, [selectedImage]);

  const handleCropAndUpload = async () => {
    if (!(selectedImage && croppedAreaPixels)) {
      return;
    }

    setIsUploading(true);

    try {
      const image = new Image();
      image.src = selectedImage;
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const TARGET_SIZE = 400;

      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        TARGET_SIZE,
        TARGET_SIZE,
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (canvasBlob) => {
            if (canvasBlob) {
              resolve(canvasBlob);
            }
          },
          "image/jpeg",
          0.85,
        );
      });

      const filename = `${filePathPrefix}${ulid()}.jpg`;
      const file = new File([blob], filename, { type: "image/jpeg" });

      const { url } = await uploadFile(filename, file, {
        access: "public",
        handleUploadUrl: uploadUrl,
      });

      setIsAvatarUpdating(true);

      onAvatarChange(url);

      setIsModalOpen(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
      setSelectedImage(null);
      setCroppedAreaPixels(null);
    } catch (_error) {
      setIsAvatarUpdating(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("flex gap-5", className)}>
      <Avatar.Root placeholderType={placeholderType} size={size}>
        {currentAvatar && <Avatar.Image alt="" src={currentAvatar} />}
      </Avatar.Root>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-label-md text-text-strong-950">{entityName}</div>
          <div className="text-paragraph-sm text-text-sub-600">
            JPG, GIF or PNG. 400x400 max.
          </div>
        </div>
        <div className="flex gap-3">
          <Button.Root
            disabled={isAvatarUpdating}
            mode="stroke"
            onClick={() => setIsModalOpen(true)}
            size="xsmall"
            variant="neutral"
          >
            {isAvatarUpdating ? (
              <>
                <StaggeredFadeLoader
                  className="flex size-5 shrink-0 items-center justify-center"
                  variant="muted"
                />
                Saving...
              </>
            ) : (
              (() => {
                if (currentAvatar) {
                  return "Change";
                }
                return "Upload";
              })()
            )}
          </Button.Root>

          <Modal.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
            <Modal.Content className="max-w-md">
              <Modal.Header
                description="Recommended size: 400x400px"
                icon={icon}
                title={modalTitle}
              />
              <Modal.Body>
                {selectedImage ? (
                  <div className="flex flex-col gap-4">
                    <ImageCropper
                      image={selectedImage}
                      onCropComplete={handleCropComplete}
                      onRemove={handleRemoveImage}
                    />
                  </div>
                ) : (
                  <ImageDropzone loading={isUploading} onDrop={handleDrop} />
                )}
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close asChild>
                  <Button.Root
                    className="w-full"
                    disabled={isUploading}
                    mode="stroke"
                    size="small"
                    variant="neutral"
                  >
                    Cancel
                  </Button.Root>
                </Modal.Close>
                <Button.Root
                  className="w-full"
                  disabled={!croppedAreaPixels || isUploading}
                  onClick={handleCropAndUpload}
                  size="small"
                  variant="primary"
                >
                  {isUploading ? (
                    <>
                      <StaggeredFadeLoader
                        className="flex size-5 shrink-0 items-center justify-center"
                        variant="muted"
                      />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button.Root>
              </Modal.Footer>
            </Modal.Content>
          </Modal.Root>
        </div>
      </div>
    </div>
  );
}

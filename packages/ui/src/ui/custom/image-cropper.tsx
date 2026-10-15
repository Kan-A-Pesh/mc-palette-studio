"use client";

import { RiCloseLine } from "@remixicon/react";
import { useState } from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import * as Button from "@/ui/button";
import * as Label from "@/ui/label";
import * as Slider from "@/ui/slider";
import * as Tooltip from "@/ui/tooltip";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedAreaPixels: Area) => void;
  onRemove: () => void;
}

export function ImageCropper({
  image,
  onCropComplete,
  onRemove,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative mt-4">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 300,
          overflow: "hidden",
          borderRadius: "15px",
        }}
      >
        <Cropper
          aspect={1}
          classes={{
            containerClassName:
              "rounded-lg bg-bg-surface-800 dark:bg-neutral-900",
            mediaClassName: "rounded-lg",
            cropAreaClassName: "rounded-lg border-2 border-primary-base",
          }}
          crop={crop}
          cropShape="round"
          image={image}
          onCropChange={setCrop}
          onCropComplete={(_, croppedAreaPixels) =>
            onCropComplete(croppedAreaPixels)
          }
          onZoomChange={setZoom}
          showGrid={false}
          style={{
            containerStyle: {
              boxShadow: "0 2px 4px #1b1c1d0a",
            },
            mediaStyle: {
              opacity: 0.9,
            },
          }}
          zoom={zoom}
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-2">
        <div className="flex-1 space-y-1">
          <Label.Root className="text-label-sm text-text-soft-400">
            Zoom
          </Label.Root>
          <Slider.Root
            aria-label="Zoom level"
            max={3}
            min={1}
            onValueChange={(value) => setZoom(value[0] ?? 1)}
            step={0.1}
            value={[zoom]}
          >
            <Slider.Thumb />
          </Slider.Root>
        </div>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root
              className="mt-6"
              mode="stroke"
              onClick={onRemove}
              size="xsmall"
              variant="error"
            >
              <Button.Icon as={RiCloseLine} />
              <span>Remove</span>
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p className="text-paragraph-xs">Remove selected image</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>
  );
}

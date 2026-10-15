"use client";

import { RiBuilding2Line } from "@repo/ui/icon";
import { upload } from "@vercel/blob/client";
import {
  AvatarUploader,
  type AvatarUploaderProps,
} from "@repo/ui/custom/avatar-uploader";

type OrganizationAvatarUploaderProps = Pick<
  AvatarUploaderProps,
  "currentAvatar" | "onAvatarChange" | "size" | "className"
> & {
  organizationName: string;
};

export function OrganizationAvatarUploader({
  organizationName,
  currentAvatar,
  onAvatarChange,
  size = "64",
  className,
}: OrganizationAvatarUploaderProps) {
  return (
    <AvatarUploader
      className={className}
      currentAvatar={currentAvatar}
      entityName={organizationName}
      filePathPrefix="organization-avatar/"
      icon={RiBuilding2Line}
      modalTitle="Organization avatar"
      onAvatarChange={onAvatarChange}
      placeholderType="company"
      size={size}
      uploadFile={upload}
      uploadUrl="/api/upload/org-avatar"
    />
  );
}

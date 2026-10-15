"use client";

import { RiUser6Line } from "@repo/ui/icon";
import { upload } from "@vercel/blob/client";
import {
  AvatarUploader,
  type AvatarUploaderProps,
} from "@repo/ui/custom/avatar-uploader";

type UserAvatarUploaderProps = Pick<
  AvatarUploaderProps,
  "currentAvatar" | "onAvatarChange" | "size" | "className"
> & {
  username: string;
};

export function UserAvatarUploader({
  username,
  currentAvatar,
  onAvatarChange,
  size = "64",
  className,
}: UserAvatarUploaderProps) {
  return (
    <AvatarUploader
      className={className}
      currentAvatar={currentAvatar}
      entityName={username}
      filePathPrefix="user-avatar/"
      icon={RiUser6Line}
      modalTitle="Upload avatar"
      onAvatarChange={onAvatarChange}
      placeholderType="user"
      size={size}
      uploadFile={upload}
      uploadUrl="/api/upload/user-avatar"
    />
  );
}

import { PROJECT } from "@repo/env/constants";

export default function Footer() {
  return (
    <div className="mx-auto flex w-full max-w-350 items-center justify-between p-6">
      <div className="text-paragraph-sm text-text-sub-600">
        © {new Date().getFullYear()} {PROJECT.COMPANY}
      </div>
    </div>
  );
}

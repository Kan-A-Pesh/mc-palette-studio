"use client";

import dynamic from "next/dynamic";

const DynamicThemeSwitch = dynamic(() => import("./util/theme-switch"), {
  ssr: false,
});

export function ThemeSwitchWrapper() {
  return <DynamicThemeSwitch />;
}

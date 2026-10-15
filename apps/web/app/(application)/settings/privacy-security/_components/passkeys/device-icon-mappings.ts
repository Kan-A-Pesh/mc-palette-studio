import {
  RiChromeLine,
  RiComputerLine,
  RiEdgeLine,
  RiFirefoxLine,
  RiMacbookLine,
  RiSmartphoneLine,
  RiUbuntuLine,
  RiWindowsLine,
} from "@repo/ui/icon";

export const DEVICE_ICON_MAPPINGS = {
  browsers: {
    chrome: RiChromeLine,
    firefox: RiFirefoxLine,
    edge: RiEdgeLine,
  },
  devices: {
    mobile: {
      keywords: ["iphone", "android", "ios"],
      icon: RiSmartphoneLine,
    },
    mac: {
      keywords: ["mac"],
      icon: RiMacbookLine,
    },
    windows: {
      keywords: ["windows"],
      icon: RiWindowsLine,
    },
    linux: {
      keywords: ["linux", "ubuntu"],
      icon: RiUbuntuLine,
    },
    computer: {
      keywords: ["computer", "pc"],
      icon: RiComputerLine,
    },
  },
} as const;

import {
  RiChat1Line,
  RiServerLine,
  RiDatabase2Line,
  RiMailLine,
  RiShieldCheckLine,
  RiPulseLine,
  RiFileTextLine,
  RiLoginBoxLine,
  RiUserAddLine,
} from "@repo/ui/icon";
import { PAGES } from "@/constants/pages";

export const features = [
  {
    icon: RiServerLine,
    title: "oRPC",
    description: "Type-safe API layer with TanStack Query integration",
  },
  {
    icon: RiDatabase2Line,
    title: "Drizzle ORM",
    description: "PostgreSQL database with type-safe queries",
  },
  {
    icon: RiShieldCheckLine,
    title: "Better Auth",
    description: "Authentication with sessions, OAuth, and 2FA",
  },
  {
    icon: RiMailLine,
    title: "React Email",
    description: "Beautiful transactional emails with Resend",
  },
  {
    icon: RiPulseLine,
    title: "Real-time",
    description: "Socket.IO broker with TCP internal communication",
  },
];

export const examples = [
  {
    href: PAGES.EXAMPLES.DOCUMENTS,
    icon: RiFileTextLine,
    title: "Collaborative Editor",
    description:
      "Real-time cursor tracking with Tiptap. See other users cursors move in real-time.",
  },
  {
    href: PAGES.EXAMPLES.CHAT,
    icon: RiChat1Line,
    title: "Chat Room",
    description:
      "Simple chat room with real-time messages. Open in multiple tabs to test.",
  },
];

export const authLinks = [
  {
    href: PAGES.AUTH.SIGN_IN,
    icon: RiLoginBoxLine,
    title: "Sign In",
    description: "Already have an account? Sign in to continue.",
  },
  {
    href: PAGES.AUTH.SIGN_UP,
    icon: RiUserAddLine,
    title: "Sign Up",
    description: "Create a new account to get started.",
  },
];

import { PLANS_LABELS, SUBSCRIPTION_PLANS } from "@repo/database/stripe";
import { RiComputerLine, RiMoonLine } from "@repo/ui/icon";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { type UseThemeProps, useTheme } from "next-themes";
import { orpc, type RouterOutput } from "@/orpc/client";

export type BadgeColor =
  | "gray"
  | "blue"
  | "purple"
  | "orange"
  | "yellow"
  | "sky"
  | "red"
  | "green"
  | "pink"
  | "teal";

type UserWithSubscription = RouterOutput["user"]["getUserWithSubscription"];

// Explicit return type required: TypeScript emits TS2742 without it because the
// inferred type of `user` and `refetch` contains internal @orpc/contract paths.
// Using UseQueryResult<UserWithSubscription> anchors these to @tanstack/react-query.
type UseUserDataResult = {
  user: UserWithSubscription | undefined;
  isLoading: boolean;
  error: UseQueryResult<UserWithSubscription>["error"];
  theme: UseThemeProps["theme"];
  systemTheme: UseThemeProps["systemTheme"];
  getPlanBadgeColor: () => BadgeColor;
  getPlanLabel: () => string;
  handleThemeChange: () => void;
  getThemeIcon: () => typeof RiComputerLine | typeof RiMoonLine;
  getThemeText: () => string;
  isDarkTheme: boolean;
  refetch: UseQueryResult<UserWithSubscription>["refetch"];
};

export function useUserData(): UseUserDataResult {
  const { theme, setTheme, systemTheme } = useTheme();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery(
    orpc.user.getUserWithSubscription.queryOptions({
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }),
  );

  const getPlanBadgeColor = (): BadgeColor => {
    if (!user?.subscription?.plan) {
      return "gray";
    }

    const plan = user.subscription.plan.toLowerCase();

    switch (plan) {
      case SUBSCRIPTION_PLANS.PRO:
        return "blue";
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return "orange";
      default:
        return "gray";
    }
  };

  const getPlanLabel = () => {
    if (!user?.subscription?.plan) {
      return PLANS_LABELS[SUBSCRIPTION_PLANS.FREE];
    }

    const planId =
      user.subscription.plan.toLowerCase() as keyof typeof PLANS_LABELS;
    return PLANS_LABELS[planId] || user.subscription.plan;
  };

  const handleThemeChange = () => {
    if (theme === "system") {
      if (systemTheme === "dark") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const getThemeIcon = () => {
    if (theme === "system") {
      return RiComputerLine;
    }
    return RiMoonLine;
  };

  const getThemeText = () => {
    if (theme === "system") {
      const mode = systemTheme === "dark" ? "Dark Mode" : "Light Mode";
      return `System (${mode})`;
    }
    return theme === "dark" ? "Dark Mode" : "Light Mode";
  };

  const isDarkTheme =
    theme === "dark" || (theme === "system" && systemTheme === "dark");

  return {
    user,
    isLoading,
    error,
    theme,
    systemTheme,
    getPlanBadgeColor,
    getPlanLabel,
    handleThemeChange,
    getThemeIcon,
    getThemeText,
    isDarkTheme,
    refetch,
  };
}

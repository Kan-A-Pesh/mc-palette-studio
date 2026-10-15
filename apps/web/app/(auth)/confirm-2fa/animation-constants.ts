export const containerVariants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
      delayChildren: 0.05,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
    y: -15,
    transition: {
      duration: 0.25,
      staggerChildren: 0.03,
      staggerDirection: -1,
      ease: [0.32, 0, 0.67, 0],
    },
  },
} as const;

export const headerVariants = {
  hidden: { opacity: 0, y: -10, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(8px)",
    transition: {
      duration: 0.25,
      ease: [0.32, 0, 0.67, 0],
    },
  },
} as const;

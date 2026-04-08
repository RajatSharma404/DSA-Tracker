/**
 * Design Tokens System
 * Single source of truth for all UI design values
 */

export const DESIGN_TOKENS = {
  // Color palette
  colors: {
    background: {
      primary: "#0a0a0a",
      secondary: "#0d0d0d",
      tertiary: "#111111",
      hover: "#1a1a1a",
      active: "#222222",
    },
    border: {
      subtle: "border-white/5",
      medium: "border-white/10",
      strong: "border-white/20",
    },
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      muted: "text-gray-500",
      disabled: "text-gray-600",
    },
    status: {
      success: {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400",
        icon: "text-green-400",
      },
      warning: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        icon: "text-amber-400",
      },
      error: {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        icon: "text-red-400",
      },
      info: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        icon: "text-blue-400",
      },
      optimal: {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400",
        icon: "text-green-400",
      },
      good: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        icon: "text-blue-400",
      },
      needsWork: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        icon: "text-amber-400",
      },
    },
  },

  // Spacing scale
  spacing: {
    xs: "p-2",
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
    xl: "p-6",
  },

  // Border radius scale
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-4xl",
  },

  // Transitions
  transitions: {
    fast: "transition-all duration-150",
    normal: "transition-all duration-300",
    slow: "transition-all duration-500",
  },

  // Shadows
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },
} as const;

/**
 * Helper function to safely merge Tailwind classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Get status style object by verdict
 */
export function getStatusStyle(
  verdict:
    | "OPTIMAL"
    | "GOOD"
    | "NEEDS WORK"
    | "success"
    | "error"
    | "warning"
    | "info",
) {
  const verdictMap: Record<string, keyof typeof DESIGN_TOKENS.colors.status> = {
    OPTIMAL: "optimal",
    GOOD: "good",
    "NEEDS WORK": "needsWork",
    success: "success",
    error: "error",
    warning: "warning",
    info: "info",
  };

  const key = verdictMap[verdict] || "good";
  return DESIGN_TOKENS.colors.status[key];
}

export function getDifficultyStyle(difficulty: "EASY" | "MEDIUM" | "HARD") {
  if (difficulty === "EASY") {
    return {
      text: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    };
  }
  if (difficulty === "MEDIUM") {
    return {
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    };
  }
  return {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  };
}

/**
 * Card base styles - use for all card/container elements
 */
export const cardStyles = {
  base: cn(
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    DESIGN_TOKENS.radius.lg,
    DESIGN_TOKENS.spacing.md,
    "bg-[#0a0a0f]",
  ),
  interactive: cn(
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    DESIGN_TOKENS.radius.lg,
    DESIGN_TOKENS.spacing.md,
    "bg-[#0a0a0f] hover:bg-[#111] cursor-pointer",
    DESIGN_TOKENS.transitions.normal,
  ),
  elevated: cn(
    "border",
    DESIGN_TOKENS.colors.border.medium,
    DESIGN_TOKENS.radius.lg,
    DESIGN_TOKENS.spacing.lg,
    "bg-[#0d0d0d] shadow-lg",
  ),
} as const;

/**
 * Button base styles
 */
export const buttonStyles = {
  primary: cn(
    "px-4 py-2",
    DESIGN_TOKENS.radius.md,
    "bg-blue-600 hover:bg-blue-700 text-white font-medium",
    DESIGN_TOKENS.transitions.fast,
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  secondary: cn(
    "px-4 py-2",
    DESIGN_TOKENS.radius.md,
    "bg-white/5 hover:bg-white/10 text-gray-300 font-medium",
    DESIGN_TOKENS.transitions.fast,
    "border",
    DESIGN_TOKENS.colors.border.medium,
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  ghost: cn(
    "px-4 py-2",
    DESIGN_TOKENS.radius.md,
    "hover:bg-white/5 text-gray-300 font-medium",
    DESIGN_TOKENS.transitions.fast,
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
} as const;

/**
 * Skeleton styles for loading states
 */
export const skeletonStyles = {
  base: cn(
    "animate-pulse",
    DESIGN_TOKENS.radius.lg,
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    "bg-white/3",
  ),
  card: cn(
    "animate-pulse",
    DESIGN_TOKENS.radius.lg,
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    "bg-white/3 min-h-[200px]",
  ),
  small: cn("animate-pulse", DESIGN_TOKENS.radius.md, "bg-white/3 h-8"),
} as const;

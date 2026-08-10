/**
 * Design Tokens System
 * Single source of truth for UI design values with CSS variable theme integration
 */

export const DESIGN_TOKENS = {
  // Color palette (mapped to dynamic theme variables)
  colors: {
    background: {
      primary: "var(--bg-primary)",
      secondary: "var(--bg-secondary)",
      tertiary: "var(--bg-tertiary)",
      card: "var(--bg-card)",
      hover: "var(--bg-hover)",
      active: "var(--bg-active)",
    },
    border: {
      subtle: "border-[var(--border-subtle)]",
      medium: "border-[var(--border-medium)]",
      strong: "border-[var(--border-strong)]",
      glow: "border-[var(--border-glow)]",
    },
    text: {
      primary: "text-[var(--text-primary)]",
      secondary: "text-[var(--text-secondary)]",
      muted: "text-[var(--text-muted)]",
      accent: "text-[var(--accent-primary)]",
    },
    status: {
      success: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        icon: "text-emerald-400",
      },
      warning: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        icon: "text-amber-400",
      },
      error: {
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-400",
        icon: "text-rose-400",
      },
      info: {
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        text: "text-sky-400",
        icon: "text-sky-400",
      },
      optimal: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        icon: "text-emerald-400",
      },
      good: {
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        text: "text-sky-400",
        icon: "text-sky-400",
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
    xl: "rounded-3xl",
  },

  // Transitions
  transitions: {
    fast: "transition-all duration-150 ease-out",
    normal: "transition-all duration-250 ease-in-out",
    slow: "transition-all duration-500 ease-in-out",
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
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
  }
  if (difficulty === "MEDIUM") {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
  }
  return {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  };
}

/**
 * Card base styles - dynamic theme responsive
 */
export const cardStyles = {
  base: cn(
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    DESIGN_TOKENS.radius.lg,
    DESIGN_TOKENS.spacing.md,
    "bg-[var(--bg-card)] text-[var(--text-primary)]",
  ),
  interactive: cn(
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    DESIGN_TOKENS.radius.lg,
    DESIGN_TOKENS.spacing.md,
    "bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] cursor-pointer",
    DESIGN_TOKENS.transitions.normal,
  ),
  elevated: cn(
    "border",
    DESIGN_TOKENS.colors.border.medium,
    DESIGN_TOKENS.radius.lg,
    DESIGN_TOKENS.spacing.lg,
    "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-xl",
  ),
} as const;

/**
 * Button base styles - dynamic theme responsive
 */
export const buttonStyles = {
  primary: cn(
    "px-4 py-2",
    DESIGN_TOKENS.radius.md,
    "bg-[var(--accent-primary)] hover:opacity-90 text-[var(--bg-primary)] font-semibold shadow-md",
    DESIGN_TOKENS.transitions.fast,
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  secondary: cn(
    "px-4 py-2",
    DESIGN_TOKENS.radius.md,
    "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium",
    DESIGN_TOKENS.transitions.fast,
    "border",
    DESIGN_TOKENS.colors.border.medium,
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  ghost: cn(
    "px-4 py-2",
    DESIGN_TOKENS.radius.md,
    "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium",
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
    "bg-[var(--bg-tertiary)]/50",
  ),
  card: cn(
    "animate-pulse",
    DESIGN_TOKENS.radius.lg,
    "border",
    DESIGN_TOKENS.colors.border.subtle,
    "bg-[var(--bg-tertiary)]/50 min-h-[200px]",
  ),
  small: cn("animate-pulse", DESIGN_TOKENS.radius.md, "bg-[var(--bg-tertiary)]/50 h-8"),
} as const;

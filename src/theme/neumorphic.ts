/**
 * Agrivus Neumorphic Design System
 * Production-ready utilities for React Native
 *
 * @version 1.0.0
 * @description Comprehensive neumorphic styling utilities including shadows,
 * colors, backgrounds, and pre-built component styles.
 */

import { Platform, ViewStyle, TextStyle } from "react-native";

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const neumorphicColors = {
  // Primary Green Palette
  primary: {
    50: "#E8F5E9",
    100: "#C8E6C9",
    200: "#A5D6A7",
    300: "#81C784",
    400: "#66BB6A",
    500: "#4CAF50",
    600: "#43A047",
    700: "#388E3C",
    800: "#2E7D32",
    900: "#1B5E20",
  },

  // Secondary Orange/Amber Palette
  secondary: {
    50: "#FFF3E0",
    100: "#FFE0B2",
    200: "#FFCC80",
    300: "#FFB74D",
    400: "#FFA726",
    500: "#FF9800",
    600: "#FB8C00",
    700: "#F57C00",
    800: "#EF6C00",
    900: "#E65100",
  },

  // Neumorphic Base Colors
  base: {
    background: "#E8E8EC",
    card: "#FAFAFA",
    input: "#F0F0F4",
    pressed: "#DCDCE0",
    shadowDark: "#BEBEC3",
    shadowLight: "#FFFFFF",
  },

  // Semantic Colors
  semantic: {
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
  },

  // Text Colors
  text: {
    primary: "#2C2C2C",
    secondary: "#666666",
    tertiary: "#999999",
    inverse: "#FFFFFF",
    accent: "#2E7D32",
  },

  // Badge Backgrounds
  badge: {
    success: { bg: "#E8F5E9", text: "#2E7D32" },
    warning: { bg: "#FFF3E0", text: "#E65100" },
    error: { bg: "#FFEBEE", text: "#C62828" },
    info: { bg: "#E3F2FD", text: "#1565C0" },
    neutral: { bg: "#F5F5F5", text: "#616161" },
  },
} as const;

// =============================================================================
// SHADOW DEFINITIONS
// =============================================================================

interface NeumorphicShadow {
  light: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  dark: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

/**
 * 5-Level Shadow Hierarchy
 * Use appropriate level based on element prominence
 */
export const shadowLevels: Record<1 | 2 | 3 | 4 | 5, NeumorphicShadow> = {
  // Level 1 - Minimal (Subtle elements)
  1: {
    light: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -2, height: -2 },
      shadowOpacity: 0.7,
      shadowRadius: 4,
      elevation: 1,
    },
    dark: {
      shadowColor: "#BEBEC3",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 1,
    },
  },

  // Level 2 - Subtle (Default cards)
  2: {
    light: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 2,
    },
    dark: {
      shadowColor: "#BEBEC3",
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 2,
    },
  },

  // Level 3 - Medium (Interactive elements)
  3: {
    light: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 4,
    },
    dark: {
      shadowColor: "#BEBEC3",
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  // Level 4 - Elevated (Focused/Hover)
  4: {
    light: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -6, height: -6 },
      shadowOpacity: 1.0,
      shadowRadius: 12,
      elevation: 6,
    },
    dark: {
      shadowColor: "#BEBEC3",
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // Level 5 - Maximum (Modals/Overlays)
  5: {
    light: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -8, height: -8 },
      shadowOpacity: 1.0,
      shadowRadius: 16,
      elevation: 8,
    },
    dark: {
      shadowColor: "#BEBEC3",
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

/**
 * Inset shadow for pressed states
 */
export const insetShadow = {
  light: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dark: {
    shadowColor: "#BEBEC3",
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
};

/**
 * Primary button glow effect
 */
export const primaryGlow = {
  shadowColor: "#4CAF50",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 6,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get neumorphic shadow style for a given level
 * On iOS, applies both light and dark shadows
 * On Android, uses elevation (limited neumorphic effect)
 */
export function getNeumorphicShadow(level: 1 | 2 | 3 | 4 | 5 = 2): ViewStyle {
  const shadow = shadowLevels[level];

  if (Platform.OS === "ios") {
    // iOS supports multiple shadows via wrapper views
    // For single shadow, use the dark shadow
    return {
      shadowColor: shadow.dark.shadowColor,
      shadowOffset: shadow.dark.shadowOffset,
      shadowOpacity: shadow.dark.shadowOpacity,
      shadowRadius: shadow.dark.shadowRadius,
    };
  }

  // Android fallback
  return {
    elevation: shadow.dark.elevation,
  };
}

/**
 * Create a colored glow effect
 */
export function getColoredGlow(
  color: string,
  intensity: number = 0.3
): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 6,
  };
}

/**
 * Get primary color at specific shade
 */
export function getPrimaryColor(
  shade: keyof typeof neumorphicColors.primary = 500
): string {
  return neumorphicColors.primary[shade];
}

/**
 * Get text color with proper contrast
 */
export function getTextColor(
  variant:
    | "primary"
    | "secondary"
    | "tertiary"
    | "inverse"
    | "accent" = "primary"
): string {
  return neumorphicColors.text[variant];
}

// =============================================================================
// PRE-BUILT COMPONENT STYLES
// =============================================================================

/**
 * Screen background styles
 */
export const screenBackgrounds = {
  default: {
    backgroundColor: neumorphicColors.base.background,
  } as ViewStyle,

  auth: {
    backgroundColor: neumorphicColors.base.background,
    // Note: Gradient should be applied via LinearGradient component
  } as ViewStyle,
};

/**
 * Card styles with neumorphic shadows
 */
export const cardStyles = {
  standard: {
    backgroundColor: neumorphicColors.base.card,
    borderRadius: 16,
    padding: 16,
    ...getNeumorphicShadow(2),
  } as ViewStyle,

  elevated: {
    backgroundColor: neumorphicColors.base.card,
    borderRadius: 16,
    padding: 16,
    ...getNeumorphicShadow(3),
  } as ViewStyle,

  stat: {
    backgroundColor: neumorphicColors.base.card,
    borderRadius: 20,
    padding: 20,
    ...getNeumorphicShadow(2),
  } as ViewStyle,

  pressed: {
    backgroundColor: neumorphicColors.base.pressed,
    borderRadius: 16,
    padding: 16,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
};

/**
 * Button styles
 */
export const buttonStyles = {
  // Primary Button (Green)
  primary: {
    default: {
      backgroundColor: neumorphicColors.primary[600],
      borderRadius: 28,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      ...primaryGlow,
    } as ViewStyle,

    pressed: {
      backgroundColor: neumorphicColors.primary[700],
      borderRadius: 28,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ scale: 0.98 }],
      shadowOpacity: 0.2,
    } as ViewStyle,

    disabled: {
      backgroundColor: neumorphicColors.primary[100],
      borderRadius: 28,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.6,
    } as ViewStyle,
  },

  // Secondary Button (Outlined)
  secondary: {
    default: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: neumorphicColors.primary[500],
      borderRadius: 28,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,

    pressed: {
      backgroundColor: `${neumorphicColors.primary[500]}1A`, // 10% opacity
      borderWidth: 2,
      borderColor: neumorphicColors.primary[500],
      borderRadius: 28,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ scale: 0.98 }],
    } as ViewStyle,
  },

  // Tertiary Button (Ghost)
  tertiary: {
    default: {
      backgroundColor: "transparent",
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
  },

  // Icon Button
  icon: {
    default: {
      backgroundColor: neumorphicColors.base.card,
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      ...getNeumorphicShadow(2),
    } as ViewStyle,

    pressed: {
      backgroundColor: neumorphicColors.base.pressed,
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ scale: 0.95 }],
    } as ViewStyle,
  },
};

/**
 * Button text styles
 */
export const buttonTextStyles = {
  primary: {
    color: neumorphicColors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,

  secondary: {
    color: neumorphicColors.primary[500],
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,

  tertiary: {
    color: neumorphicColors.primary[500],
    fontSize: 16,
    fontWeight: "500",
  } as TextStyle,
};

/**
 * Input field styles
 */
export const inputStyles = {
  default: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
    fontSize: 16,
    color: neumorphicColors.text.primary,
  } as ViewStyle & TextStyle,

  focused: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: neumorphicColors.primary[500],
    fontSize: 16,
    color: neumorphicColors.text.primary,
  } as ViewStyle & TextStyle,

  error: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: neumorphicColors.semantic.error,
    fontSize: 16,
    color: neumorphicColors.text.primary,
  } as ViewStyle & TextStyle,

  search: {
    backgroundColor: neumorphicColors.base.card,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 44,
    fontSize: 16,
    color: neumorphicColors.text.primary,
    ...getNeumorphicShadow(1),
  } as ViewStyle & TextStyle,
};

/**
 * Badge styles
 */
export const badgeStyles = {
  base: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  } as ViewStyle,

  success: {
    backgroundColor: neumorphicColors.badge.success.bg,
  } as ViewStyle,

  warning: {
    backgroundColor: neumorphicColors.badge.warning.bg,
  } as ViewStyle,

  error: {
    backgroundColor: neumorphicColors.badge.error.bg,
  } as ViewStyle,

  info: {
    backgroundColor: neumorphicColors.badge.info.bg,
  } as ViewStyle,

  neutral: {
    backgroundColor: neumorphicColors.badge.neutral.bg,
  } as ViewStyle,
};

export const badgeTextStyles = {
  base: {
    fontSize: 12,
    fontWeight: "600",
  } as TextStyle,

  success: {
    color: neumorphicColors.badge.success.text,
  } as TextStyle,

  warning: {
    color: neumorphicColors.badge.warning.text,
  } as TextStyle,

  error: {
    color: neumorphicColors.badge.error.text,
  } as TextStyle,

  info: {
    color: neumorphicColors.badge.info.text,
  } as TextStyle,

  neutral: {
    color: neumorphicColors.badge.neutral.text,
  } as TextStyle,
};

/**
 * Avatar styles
 */
export const avatarStyles = {
  small: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: neumorphicColors.primary[50],
    borderWidth: 3,
    borderColor: neumorphicColors.base.card,
    ...getNeumorphicShadow(2),
  } as ViewStyle,

  medium: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: neumorphicColors.primary[50],
    borderWidth: 3,
    borderColor: neumorphicColors.base.card,
    ...getNeumorphicShadow(2),
  } as ViewStyle,

  large: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: neumorphicColors.primary[50],
    borderWidth: 3,
    borderColor: neumorphicColors.base.card,
    ...getNeumorphicShadow(2),
  } as ViewStyle,

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: neumorphicColors.base.card,
  } as ViewStyle,
};

// =============================================================================
// LEAF PATTERN CONFIGURATIONS
// =============================================================================

export interface LeafConfig {
  opacity: number;
  positions: Array<{
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    rotation: number;
    size: number;
  }>;
}

export const leafPatterns: Record<string, LeafConfig> = {
  auth: {
    opacity: 0.3,
    positions: [
      { top: "5%", left: "5%", rotation: -30, size: 80 },
      { top: "8%", right: "10%", rotation: 25, size: 60 },
      { bottom: "15%", left: "8%", rotation: 45, size: 70 },
      { bottom: "10%", right: "5%", rotation: -15, size: 90 },
    ],
  },
  dashboard: {
    opacity: 0.25,
    positions: [
      { top: "3%", right: "5%", rotation: 20, size: 70 },
      { top: "40%", left: "2%", rotation: -25, size: 50 },
      { bottom: "20%", left: "10%", rotation: 35, size: 60 },
    ],
  },
  list: {
    opacity: 0.15,
    positions: [
      { top: "5%", right: "5%", rotation: 15, size: 50 },
      { bottom: "10%", left: "5%", rotation: -20, size: 45 },
    ],
  },
  detail: {
    opacity: 0.1,
    positions: [{ top: "3%", right: "3%", rotation: 10, size: 45 }],
  },
  form: {
    opacity: 0.1,
    positions: [{ bottom: "5%", right: "5%", rotation: -10, size: 50 }],
  },
  profile: {
    opacity: 0.2,
    positions: [
      { top: "15%", left: "5%", rotation: -20, size: 55 },
      { top: "25%", right: "8%", rotation: 30, size: 45 },
      { bottom: "20%", left: "10%", rotation: 15, size: 50 },
    ],
  },
};

// =============================================================================
// TYPOGRAPHY STYLES
// =============================================================================

/**
 * Font Family Configuration
 * Uses system fonts optimized for each platform:
 * - iOS: SF Pro (system default) with -apple-system fallback
 * - Android: Roboto (system default)
 *
 * For custom fonts like Inter or Poppins, load them via expo-font
 * and replace the fontFamily values below.
 */
export const fontFamilies = {
  // Primary font for headings and emphasis
  heading: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  // Body font for general text
  body: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  // Monospace for numbers and code
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
} as const;

/**
 * Modern Neumorphic Typography System
 *
 * Design Principles:
 * - Clean, geometric typefaces that complement soft shadows
 * - Generous letter-spacing for readability
 * - Optimized line heights for comfortable reading
 * - Subtle weight variations for visual hierarchy
 */
export const typography = {
  // Display - Hero text, large callouts
  display: {
    fontSize: 40,
    fontWeight: "800" as const,
    lineHeight: 48,
    letterSpacing: -1,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // H1 - Page titles
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // H2 - Section headers
  h2: {
    fontSize: 26,
    fontWeight: "700" as const,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // H3 - Subsection headers
  h3: {
    fontSize: 22,
    fontWeight: "600" as const,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // H4 - Card titles, list headers
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 26,
    letterSpacing: 0,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // H5 - Small headers
  h5: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    letterSpacing: 0.1,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // H6 - Smallest headers
  h6: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // Body Large - Featured body text
  bodyLarge: {
    fontSize: 18,
    fontWeight: "400" as const,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.body,
  } as TextStyle,

  // Body - Default body text
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.body,
  } as TextStyle,

  // Body Small - Secondary body text
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 21,
    letterSpacing: 0.1,
    color: neumorphicColors.text.secondary,
    fontFamily: fontFamilies.body,
  } as TextStyle,

  // Caption - Small labels, timestamps
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: neumorphicColors.text.tertiary,
    fontFamily: fontFamilies.body,
  } as TextStyle,

  // Overline - Small uppercase labels
  overline: {
    fontSize: 11,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: neumorphicColors.text.tertiary,
    fontFamily: fontFamilies.body,
  } as TextStyle,

  // Button text styles
  buttonLarge: {
    fontSize: 17,
    fontWeight: "600" as const,
    lineHeight: 22,
    letterSpacing: 0.3,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  button: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  buttonSmall: {
    fontSize: 13,
    fontWeight: "600" as const,
    lineHeight: 18,
    letterSpacing: 0.3,
    fontFamily: fontFamilies.heading,
  } as TextStyle,

  // Label - Form labels, pill text
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: neumorphicColors.text.secondary,
    fontFamily: fontFamilies.body,
  } as TextStyle,

  // Number - Numeric values, stats
  number: {
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.mono,
  } as TextStyle,

  numberSmall: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: neumorphicColors.text.primary,
    fontFamily: fontFamilies.mono,
  } as TextStyle,

  // Size utilities for direct font-size access
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
    "6xl": 40,
  } as const,

  // Weight utilities for direct font-weight access
  weights: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  } as const,
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 80,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  pill: 28,
  full: 9999,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  colors: neumorphicColors,
  shadows: shadowLevels,
  insetShadow,
  primaryGlow,
  screens: screenBackgrounds,
  cards: cardStyles,
  buttons: buttonStyles,
  buttonText: buttonTextStyles,
  inputs: inputStyles,
  badges: badgeStyles,
  badgeText: badgeTextStyles,
  avatars: avatarStyles,
  leaves: leafPatterns,
  typography,
  fontFamilies,
  spacing,
  borderRadius,
  // Helper functions
  getNeumorphicShadow,
  getColoredGlow,
  getPrimaryColor,
  getTextColor,
};

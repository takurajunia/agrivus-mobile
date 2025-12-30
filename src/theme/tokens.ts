import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Color Palette
export const colors = {
  // Primary Colors
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

  // Secondary Colors
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

  // Neutral Colors
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // Semantic Colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",

  // Background Colors
  background: {
    primary: "#FFFFFF",
    secondary: "#F8F9FA",
    tertiary: "#F1F3F4",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Glass Morphism Colors
  glass: {
    light: "rgba(255, 255, 255, 0.25)",
    medium: "rgba(255, 255, 255, 0.15)",
    dark: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.2)",
  },

  // Text Colors
  text: {
    primary: "#1A1A1A",
    secondary: "#666666",
    tertiary: "#999999",
    inverse: "#FFFFFF",
    accent: "#2E7D32",
  },

  // Border Colors
  border: {
    light: "#E0E0E0",
    medium: "#BDBDBD",
    dark: "#757575",
  },

  // Shadow Colors
  shadow: {
    light: "rgba(0, 0, 0, 0.04)",
    medium: "rgba(0, 0, 0, 0.08)",
    dark: "rgba(0, 0, 0, 0.16)",
    colored: "rgba(46, 125, 50, 0.1)",
  },
};

// Typography
export const typography = {
  // Font Families
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 80,
  "5xl": 96,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 16,
    elevation: 12,
  },
  colored: {
    shadowColor: colors.shadow.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Animation Durations
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: "ease-in-out",
    easeOut: "ease-out",
    easeIn: "ease-in",
    linear: "linear",
  },
};

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Screen Dimensions
export const screen = {
  width: screenWidth,
  height: screenHeight,
  isSmall: screenWidth < breakpoints.sm,
  isMedium: screenWidth >= breakpoints.sm && screenWidth < breakpoints.md,
  isLarge: screenWidth >= breakpoints.md,
};

// Z-Index
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};

// Opacity
export const opacity = {
  0: 0,
  25: 0.25,
  50: 0.5,
  75: 0.75,
  100: 1,
};

// Theme Object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  screen,
  zIndex,
  opacity,
};

export type Theme = typeof theme;
export default theme;

/**
 * NeumorphicBadge Component
 *
 * Status badges with neumorphic styling for different states.
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import {
  neumorphicColors,
  badgeStyles,
  badgeTextStyles,
  spacing,
  borderRadius,
} from "../../theme/neumorphic";

type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "primary";
type BadgeSize = "small" | "medium" | "large";

interface NeumorphicBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  dot?: boolean;
}

const NeumorphicBadge: React.FC<NeumorphicBadgeProps> = ({
  label,
  variant = "neutral",
  size = "medium",
  icon,
  style,
  textStyle,
  dot = false,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
      success: {
        bg: neumorphicColors.badge.success.bg,
        text: neumorphicColors.badge.success.text,
      },
      warning: {
        bg: neumorphicColors.badge.warning.bg,
        text: neumorphicColors.badge.warning.text,
      },
      error: {
        bg: neumorphicColors.badge.error.bg,
        text: neumorphicColors.badge.error.text,
      },
      info: {
        bg: neumorphicColors.badge.info.bg,
        text: neumorphicColors.badge.info.text,
      },
      neutral: {
        bg: neumorphicColors.badge.neutral.bg,
        text: neumorphicColors.badge.neutral.text,
      },
      primary: {
        bg: neumorphicColors.primary[50],
        text: neumorphicColors.primary[700],
      },
    };

    const colors = variantMap[variant];
    return {
      container: { backgroundColor: colors.bg },
      text: { color: colors.text },
    };
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 8,
          },
          text: { fontSize: 10 },
        };
      case "large":
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 16,
          },
          text: { fontSize: 14 },
        };
      default:
        return {
          container: {
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 12,
          },
          text: { fontSize: 12 },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (dot) {
    return (
      <View style={[styles.dotContainer, style]}>
        <View style={[styles.dot, variantStyles.container]} />
        <Text
          style={[
            styles.dotLabel,
            variantStyles.text,
            sizeStyles.text,
            textStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[styles.label, variantStyles.text, sizeStyles.text, textStyle]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
  icon: {
    marginRight: spacing.xs,
  },
  dotContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  dotLabel: {
    fontWeight: "500",
  },
});

export default NeumorphicBadge;

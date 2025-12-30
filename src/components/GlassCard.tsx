import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "../theme/tokens";

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: "light" | "medium" | "dark";
  borderRadius?: number;
  [key: string]: any;
};

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = "medium",
  borderRadius = theme.borderRadius.lg,
  ...props
}) => {
  const getIntensity = () => {
    switch (intensity) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      default:
        return "light";
    }
  };

  const getTint = () => {
    switch (intensity) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      default:
        return "default";
    }
  };

  return (
    <View style={[styles.container, { borderRadius }, style]} {...props}>
      <BlurView
        intensity={intensity === "light" ? 20 : intensity === "dark" ? 60 : 40}
        tint={getTint()}
        style={[styles.blurView, { borderRadius }]}
      >
        <View style={[styles.content, { borderRadius }]}>{children}</View>
      </BlurView>
    </View>
  );
};

// Alternative implementation without BlurView for devices that don't support it
export const SimpleGlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = "medium",
  borderRadius = theme.borderRadius.lg,
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (intensity) {
      case "light":
        return theme.colors.glass.light;
      case "dark":
        return theme.colors.glass.dark;
      default:
        return theme.colors.glass.medium;
    }
  };

  return (
    <View
      style={[
        styles.simpleContainer,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius,
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    ...theme.shadows.md,
  },
  blurView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  simpleContainer: {
    padding: theme.spacing.lg,
  },
});

export default GlassCard;

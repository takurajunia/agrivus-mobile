/**
 * NeumorphicProgressBar Component
 *
 * Progress indicator with neumorphic styling and animations.
 */

import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  neumorphicColors,
  spacing,
  borderRadius,
  typography,
} from "../../theme/neumorphic";

interface NeumorphicProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  animated?: boolean;
}

const NeumorphicProgressBar: React.FC<NeumorphicProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = "primary",
  size = "medium",
  style,
  animated = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, progressAnim]);

  const getColorStyles = (): readonly [string, string] => {
    const colors: Record<typeof color, readonly [string, string]> = {
      primary: [
        neumorphicColors.primary[400],
        neumorphicColors.primary[600],
      ] as const,
      secondary: [
        neumorphicColors.secondary[400],
        neumorphicColors.secondary[600],
      ] as const,
      success: [neumorphicColors.semantic.success, "#2E7D32"] as const,
      warning: [neumorphicColors.semantic.warning, "#F57C00"] as const,
      error: [neumorphicColors.semantic.error, "#C62828"] as const,
    };
    return colors[color];
  };

  const getSizeStyles = () => {
    const sizes = {
      small: { height: 6, borderRadius: 3 },
      medium: { height: 10, borderRadius: 5 },
      large: { height: 16, borderRadius: 8 },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();
  const gradientColors = getColorStyles();

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.track,
          {
            height: sizeStyles.height,
            borderRadius: sizeStyles.borderRadius,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressContainer,
            {
              width,
              height: sizeStyles.height,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progress, { borderRadius: sizeStyles.borderRadius }]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  percentage: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  track: {
    backgroundColor: neumorphicColors.base.input,
    overflow: "hidden",
  },
  progressContainer: {
    overflow: "hidden",
  },
  progress: {
    flex: 1,
  },
});

export default NeumorphicProgressBar;

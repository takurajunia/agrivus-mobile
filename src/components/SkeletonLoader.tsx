import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { theme } from "../theme/tokens";

type SkeletonLoaderProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
  animated = true,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [animated]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: animated ? opacityAnim : 0.3,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton components
export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 1,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        height={16}
        width={index === lines - 1 ? "70%" : "100%"}
        style={{ marginBottom: index < lines - 1 ? theme.spacing.sm : 0 }}
      />
    ))}
  </View>
);

export const SkeletonAvatar: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 40,
  style,
}) => (
  <SkeletonLoader
    width={size}
    height={size}
    borderRadius={size / 2}
    style={style}
  />
);

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardSkeleton, style]}>
    <View style={styles.cardHeader}>
      <SkeletonAvatar size={32} />
      <View style={styles.cardHeaderText}>
        <SkeletonLoader width={120} height={14} />
        <SkeletonLoader width={80} height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <SkeletonText lines={2} style={{ marginTop: theme.spacing.md }} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.neutral[200],
  },
  cardSkeleton: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});

export default SkeletonLoader;

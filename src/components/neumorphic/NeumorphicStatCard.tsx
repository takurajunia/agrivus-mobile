/**
 * NeumorphicStatCard Component
 *
 * Statistics display card with neumorphic styling,
 * trend indicators, and animated values.
 */

import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, ViewStyle } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import {
  neumorphicColors,
  getNeumorphicShadow,
  typography,
  spacing,
  borderRadius,
} from "../../theme/neumorphic";

type TrendDirection = "up" | "down" | "neutral";

interface NeumorphicStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?:
    | {
        value: number;
        direction: TrendDirection;
      }
    | TrendDirection;
  icon?: React.ReactNode;
  iconColor?: string;
  style?: ViewStyle;
  animationDelay?: number;
  onPress?: () => void;
}

const NeumorphicStatCard: React.FC<NeumorphicStatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconColor = neumorphicColors.primary[600],
  style,
  animationDelay = 0,
  onPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationDelay, fadeAnim, translateYAnim]);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }).start();
    }
  };

  const getTrendColor = () => {
    if (!trend) return neumorphicColors.text.tertiary;
    const direction = typeof trend === "string" ? trend : trend.direction;

    switch (direction) {
      case "up":
        return neumorphicColors.semantic.success;
      case "down":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const color = getTrendColor();
    const size = 14;
    const direction = typeof trend === "string" ? trend : trend.direction;

    switch (direction) {
      case "up":
        return <TrendingUp size={size} color={color} />;
      case "down":
        return <TrendingDown size={size} color={color} />;
      default:
        return <Minus size={size} color={color} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getNeumorphicShadow(2),
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}
        >
          {icon}
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>

        {trend && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {typeof trend === "string"
                ? trend.charAt(0).toUpperCase() + trend.slice(1)
                : `${trend.value > 0 ? "+" : ""}${trend.value}%`}
            </Text>
          </View>
        )}
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minWidth: 140,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  value: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trendValue: {
    ...typography.caption,
    fontWeight: "600",
    marginLeft: 4,
  },
  subtitle: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default NeumorphicStatCard;

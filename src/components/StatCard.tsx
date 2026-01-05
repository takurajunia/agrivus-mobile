import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../theme/tokens";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  style,
}) => (
  <View style={[styles.card, style]}>
    {icon && (
      <View style={styles.iconContainer}>
        {icon}
      </View>
    )}
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {trend && (
      <View style={[
        styles.trendContainer,
        trend.isPositive ? styles.trendPositive : styles.trendNegative
      ]}>
        <Text style={[
          styles.trendText,
          trend.isPositive ? styles.trendTextPositive : styles.trendTextNegative
        ]}>
          {trend.isPositive ? "+" : ""}{trend.value}%
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.neumorphic.card,
    borderRadius: theme.borderRadius["2xl"],
    padding: theme.spacing.lg,
    alignItems: "center",
    margin: theme.spacing.sm,
    ...theme.neumorphicShadows.level2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary[500]}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  value: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  trendContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  trendPositive: {
    backgroundColor: theme.colors.badge.success.bg,
  },
  trendNegative: {
    backgroundColor: theme.colors.badge.error.bg,
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  trendTextPositive: {
    color: theme.colors.badge.success.text,
  },
  trendTextNegative: {
    color: theme.colors.badge.error.text,
  },
});

export default StatCard;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { NeumorphicCard } from "./neumorphic";
import type { MarketInsight } from "../services/recommendationsService";

interface MarketInsightCardProps {
  insight: MarketInsight;
}

const MarketInsightCard: React.FC<MarketInsightCardProps> = ({ insight }) => {
  const getTrendIcon = (trend: string): string => {
    if (trend === "increasing") return "📈";
    if (trend === "decreasing") return "📉";
    return "➡️";
  };

  const getTrendStyle = (trend: string) => {
    if (trend === "increasing") return styles.trendIncreasing;
    if (trend === "decreasing") return styles.trendDecreasing;
    return styles.trendStable;
  };

  const getTrendTextStyle = (trend: string) => {
    if (trend === "increasing") return styles.trendTextIncreasing;
    if (trend === "decreasing") return styles.trendTextDecreasing;
    return styles.trendTextStable;
  };

  const demandSupplyRatio = parseFloat(insight.demandSupplyRatio);
  const isHighDemand = demandSupplyRatio > 1.2;
  const isLowDemand = demandSupplyRatio < 0.8;

  const getDemandSupplyStyle = () => {
    if (isHighDemand) return styles.demandSupplyHigh;
    if (isLowDemand) return styles.demandSupplyLow;
    return styles.demandSupplyNeutral;
  };

  const getDemandSupplyTextStyle = () => {
    if (isHighDemand) return styles.demandSupplyTextHigh;
    if (isLowDemand) return styles.demandSupplyTextLow;
    return styles.demandSupplyTextNeutral;
  };

  return (
    <NeumorphicCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.cropType}>{insight.cropType}</Text>
          <Text style={styles.region}>📍 {insight.region}</Text>
        </View>
        <View style={[styles.trendBadge, getTrendStyle(insight.trend)]}>
          <Text style={[styles.trendText, getTrendTextStyle(insight.trend)]}>
            {getTrendIcon(insight.trend)} {insight.trend}
          </Text>
        </View>
      </View>

      {/* Price Info */}
      <View style={styles.priceContainer}>
        <View style={styles.mainPrice}>
          <Text style={styles.priceValue}>
            ${parseFloat(insight.averagePrice).toFixed(2)}
          </Text>
          <Text style={styles.priceLabel}>/unit avg</Text>
        </View>
        <View style={styles.priceRange}>
          <Text style={styles.priceRangeText}>
            Min: ${parseFloat(insight.minPrice).toFixed(2)}
          </Text>
          <Text style={styles.priceRangeText}>
            Max: ${parseFloat(insight.maxPrice).toFixed(2)}
          </Text>
          <Text
            style={[
              styles.trendPercentage,
              parseFloat(insight.trendPercentage) > 0
                ? styles.trendPositive
                : styles.trendNegative,
            ]}
          >
            {parseFloat(insight.trendPercentage) > 0 ? "+" : ""}
            {parseFloat(insight.trendPercentage).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Demand/Supply */}
      <View style={styles.demandSupplyRow}>
        <View style={styles.demandCard}>
          <Text style={styles.demandLabel}>Total Demand</Text>
          <Text style={styles.demandValue}>
            {insight.totalDemand.toLocaleString()} units
          </Text>
        </View>
        <View style={styles.supplyCard}>
          <Text style={styles.supplyLabel}>Total Supply</Text>
          <Text style={styles.supplyValue}>
            {insight.totalSupply.toLocaleString()} units
          </Text>
        </View>
      </View>

      {/* Demand-Supply Ratio */}
      <View style={[styles.ratioContainer, getDemandSupplyStyle()]}>
        <View style={styles.ratioRow}>
          <Text style={styles.ratioLabel}>Demand/Supply Ratio</Text>
          <Text style={[styles.ratioValue, getDemandSupplyTextStyle()]}>
            {demandSupplyRatio.toFixed(2)}
          </Text>
        </View>
        <Text style={styles.ratioDescription}>
          {isHighDemand && "🔥 High demand! Good opportunity for sellers."}
          {isLowDemand && "⚠️ Low demand. Consider waiting or adjusting price."}
          {!isHighDemand && !isLowDemand && "✓ Balanced market conditions."}
        </Text>
      </View>

      {/* Market Activity */}
      <View style={styles.activityRow}>
        <View style={styles.activityItem}>
          <Text style={styles.activityLabel}>Transactions</Text>
          <Text style={styles.activityValue}>{insight.transactionCount}</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityLabel}>Avg Order Size</Text>
          <Text style={styles.activityValue}>
            {parseFloat(insight.averageOrderSize).toFixed(0)} units
          </Text>
        </View>
      </View>

      {/* Period */}
      <Text style={styles.periodText}>
        Data from {new Date(insight.periodStart).toLocaleDateString()} to{" "}
        {new Date(insight.periodEnd).toLocaleDateString()}
      </Text>
    </NeumorphicCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  cropType: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  region: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  trendIncreasing: {
    backgroundColor: "#E8F5E9",
  },
  trendDecreasing: {
    backgroundColor: "#FFEBEE",
  },
  trendStable: {
    backgroundColor: neumorphicColors.base.input,
  },
  trendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  trendTextIncreasing: {
    color: "#2E7D32",
  },
  trendTextDecreasing: {
    color: "#C62828",
  },
  trendTextStable: {
    color: neumorphicColors.text.secondary,
  },
  priceContainer: {
    marginBottom: spacing.md,
  },
  mainPrice: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  priceLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.xs,
  },
  priceRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  priceRangeText: {
    fontSize: 13,
    color: neumorphicColors.text.secondary,
  },
  trendPercentage: {
    fontSize: 13,
    fontWeight: "600",
  },
  trendPositive: {
    color: "#2E7D32",
  },
  trendNegative: {
    color: "#C62828",
  },
  demandSupplyRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  demandCard: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  demandLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: spacing.xs,
  },
  demandValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D47A1",
  },
  supplyCard: {
    flex: 1,
    backgroundColor: "#F3E5F5",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  supplyLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7B1FA2",
    marginBottom: spacing.xs,
  },
  supplyValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A148C",
  },
  ratioContainer: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  demandSupplyHigh: {
    backgroundColor: "#E8F5E9",
    borderColor: "#C8E6C9",
  },
  demandSupplyLow: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FFCDD2",
  },
  demandSupplyNeutral: {
    backgroundColor: neumorphicColors.base.input,
    borderColor: neumorphicColors.base.shadowDark,
  },
  ratioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  ratioLabel: {
    ...typography.h5,
    color: neumorphicColors.text.secondary,
  },
  ratioValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  demandSupplyTextHigh: {
    color: "#2E7D32",
  },
  demandSupplyTextLow: {
    color: "#C62828",
  },
  demandSupplyTextNeutral: {
    color: neumorphicColors.text.primary,
  },
  ratioDescription: {
    fontSize: 12,
    color: neumorphicColors.text.secondary,
  },
  activityRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  activityItem: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 12,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  activityValue: {
    ...typography.h5,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  periodText: {
    fontSize: 11,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
  },
});

export default MarketInsightCard;

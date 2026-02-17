import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { NeumorphicCard, NeumorphicButton } from "./neumorphic";
import type { Recommendation } from "../services/recommendationsService";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onReject,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      crop_suggestion: "🌾",
      buyer_match: "🤝",
      pricing_optimization: "💰",
      seasonal_insight: "📅",
      product_bundle: "📦",
      market_trend: "📈",
    };
    return icons[type] || "💡";
  };

  const getTypeName = (type: string): string => {
    const names: Record<string, string> = {
      crop_suggestion: "Crop Suggestion",
      buyer_match: "Buyer Match",
      pricing_optimization: "Pricing Optimization",
      seasonal_insight: "Seasonal Insight",
      product_bundle: "Product Bundle",
      market_trend: "Market Trend",
    };
    return names[type] || type;
  };

  const getConfidenceStyle = (score: number) => {
    if (score >= 80) return styles.confidenceHigh;
    if (score >= 60) return styles.confidenceMedium;
    return styles.confidenceLow;
  };

  const getConfidenceTextStyle = (score: number) => {
    if (score >= 80) return styles.confidenceTextHigh;
    if (score >= 60) return styles.confidenceTextMedium;
    return styles.confidenceTextLow;
  };

  return (
    <NeumorphicCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{getTypeIcon(recommendation.type)}</Text>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.title} numberOfLines={2}>
                {recommendation.title}
              </Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {getTypeName(recommendation.type)}
                </Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={3}>
              {recommendation.description}
            </Text>
          </View>
        </View>

        {/* Confidence Score */}
        <View
          style={[
            styles.confidenceBadge,
            getConfidenceStyle(recommendation.confidenceScore),
          ]}
        >
          <Text
            style={[
              styles.confidenceText,
              getConfidenceTextStyle(recommendation.confidenceScore),
            ]}
          >
            {recommendation.confidenceScore}%
          </Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Potential Revenue</Text>
          <Text style={styles.metricValueGreen}>
            ${parseFloat(recommendation.potentialRevenue).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Estimated ROI</Text>
          <Text style={styles.metricValueBlue}>
            {parseFloat(recommendation.estimatedRoi).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Details Toggle */}
      {recommendation.data?.reasoning && (
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? "▼" : "▶"} {showDetails ? "Hide" : "Show"} Details
          </Text>
        </TouchableOpacity>
      )}

      {/* Expanded Details */}
      {showDetails && recommendation.data?.reasoning && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Why we recommend this:</Text>
          {recommendation.data.reasoning.map((reason: string, idx: number) => (
            <View key={idx} style={styles.reasonRow}>
              <Text style={styles.reasonCheck}>✓</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}

          {/* Additional Data for Crop Suggestion */}
          {recommendation.type === "crop_suggestion" &&
            recommendation.data.cropType && (
              <View style={styles.additionalData}>
                <Text style={styles.additionalDataText}>
                  <Text style={styles.bold}>Crop:</Text>{" "}
                  {recommendation.data.cropType} |{" "}
                  <Text style={styles.bold}>Region:</Text>{" "}
                  {recommendation.data.region} |{" "}
                  <Text style={styles.bold}>Avg Price:</Text> $
                  {parseFloat(recommendation.data.averagePrice).toFixed(2)}
                </Text>
              </View>
            )}

          {/* Additional Data for Buyer Match */}
          {recommendation.type === "buyer_match" &&
            recommendation.data.buyerName && (
              <View style={styles.additionalData}>
                <Text style={styles.additionalDataText}>
                  <Text style={styles.bold}>Buyer:</Text>{" "}
                  {recommendation.data.buyerName} |{" "}
                  <Text style={styles.bold}>Purchases:</Text>{" "}
                  {recommendation.data.purchaseCount} |{" "}
                  <Text style={styles.bold}>Rating:</Text>{" "}
                  {recommendation.data.buyerScore}/100
                </Text>
              </View>
            )}

          {/* Additional Data for Pricing Optimization */}
          {recommendation.type === "pricing_optimization" &&
            recommendation.data.currentPrice && (
              <View style={styles.additionalData}>
                <Text style={styles.additionalDataText}>
                  <Text style={styles.bold}>Current:</Text> $
                  {parseFloat(recommendation.data.currentPrice).toFixed(2)} |{" "}
                  <Text style={styles.bold}>Suggested:</Text> $
                  {parseFloat(recommendation.data.suggestedPrice).toFixed(2)} |{" "}
                  <Text style={styles.bold}>Market Avg:</Text> $
                  {parseFloat(recommendation.data.marketAverage).toFixed(2)}
                </Text>
              </View>
            )}
        </View>
      )}

      {/* Actions */}
      {recommendation.status === "active" && (
        <View style={styles.actionsRow}>
          <NeumorphicButton
            title="✓ Accept"
            onPress={() => onAccept(recommendation.id)}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
          <NeumorphicButton
            title="✗ Not Interested"
            onPress={() => onReject(recommendation.id)}
            variant="tertiary"
            size="small"
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Status Badge */}
      {recommendation.status !== "active" && (
        <View style={styles.statusContainer}>
          {recommendation.status === "accepted" && (
            <View style={styles.statusAccepted}>
              <Text style={styles.statusAcceptedText}>
                ✓ Accepted{" "}
                {recommendation.acceptedAt &&
                  `on ${new Date(recommendation.acceptedAt).toLocaleDateString()}`}
              </Text>
            </View>
          )}
          {recommendation.status === "rejected" && (
            <View style={styles.statusRejected}>
              <Text style={styles.statusRejectedText}>✗ Not Interested</Text>
            </View>
          )}
        </View>
      )}

      {/* Expiry */}
      {recommendation.expiresAt && (
        <Text style={styles.expiryText}>
          Expires {new Date(recommendation.expiresAt).toLocaleDateString()}
        </Text>
      )}
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
  titleRow: {
    flexDirection: "row",
    flex: 1,
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginRight: spacing.xs,
  },
  typeBadge: {
    backgroundColor: neumorphicColors.base.input,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    color: neumorphicColors.text.secondary,
  },
  description: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    lineHeight: 20,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  confidenceHigh: {
    backgroundColor: "#E8F5E9",
  },
  confidenceMedium: {
    backgroundColor: "#FFF8E1",
  },
  confidenceLow: {
    backgroundColor: "#FFF3E0",
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  confidenceTextHigh: {
    color: "#2E7D32",
  },
  confidenceTextMedium: {
    color: "#F57C00",
  },
  confidenceTextLow: {
    color: "#E65100",
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricValueGreen: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
  },
  metricValueBlue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1565C0",
  },
  detailsToggle: {
    marginBottom: spacing.sm,
  },
  detailsToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976D2",
  },
  detailsContainer: {
    backgroundColor: neumorphicColors.base.input,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  detailsTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  reasonCheck: {
    color: "#4CAF50",
    marginRight: spacing.xs,
    fontWeight: "600",
  },
  reasonText: {
    flex: 1,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  additionalData: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark,
  },
  additionalDataText: {
    fontSize: 12,
    color: neumorphicColors.text.secondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  statusAccepted: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  statusAcceptedText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },
  statusRejected: {
    backgroundColor: neumorphicColors.base.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  statusRejectedText: {
    color: neumorphicColors.text.secondary,
    fontWeight: "600",
    fontSize: 14,
  },
  expiryText: {
    fontSize: 12,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});

export default RecommendationCard;

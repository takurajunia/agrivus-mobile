import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Award,
  FileText,
  Truck,
  ChevronRight,
  TrendingUp,
  Shield,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../../src/theme/neumorphic";
import exportService from "../../../src/services/exportService";

interface AssessmentResult {
  id: string;
  productType: string;
  targetMarkets: string[];
  readinessLevel: "high" | "medium" | "low";
  overallScore: number;
  recommendations: {
    category: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  marketRequirements: {
    market: string;
    requirements: string[];
    estimatedTimeToCompliance: string;
  }[];
  nextSteps: string[];
  createdAt: string;
}

export default function ExportAssessmentResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentResult();
  }, [id]);

  const fetchAssessmentResult = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await exportService.getAssessmentById(id);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assessment result:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return neumorphicColors.semantic.success;
      case "medium":
        return neumorphicColors.semantic.warning;
      case "low":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.secondary;
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return (
          <CheckCircle size={32} color={neumorphicColors.semantic.success} />
        );
      case "medium":
        return (
          <AlertTriangle size={32} color={neumorphicColors.semantic.warning} />
        );
      case "low":
        return <XCircle size={32} color={neumorphicColors.semantic.error} />;
      default:
        return (
          <AlertTriangle size={32} color={neumorphicColors.text.secondary} />
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return neumorphicColors.semantic.error;
      case "medium":
        return neumorphicColors.semantic.warning;
      case "low":
        return neumorphicColors.semantic.info;
      default:
        return neumorphicColors.text.secondary;
    }
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (!result) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="default"
            size="medium"
          />
          <Text style={styles.title}>Assessment Results</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <XCircle
            size={64}
            color={neumorphicColors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Results Not Found</Text>
          <Text style={styles.errorSubtitle}>
            Unable to load your assessment results.
          </Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="detail" showLeaves={true}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <Text style={styles.title}>Assessment Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <NeumorphicCard variant="elevated" style={styles.scoreCard}>
          {getReadinessIcon(result.readinessLevel)}
          <Text style={styles.productType}>{result.productType}</Text>
          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.scoreValue,
                { color: getReadinessColor(result.readinessLevel) },
              ]}
            >
              {result.overallScore}%
            </Text>
            <Text style={styles.scoreLabel}>Export Readiness Score</Text>
          </View>
          <View
            style={[
              styles.readinessBadge,
              {
                backgroundColor: `${getReadinessColor(
                  result.readinessLevel
                )}15`,
              },
            ]}
          >
            <Text
              style={[
                styles.readinessText,
                { color: getReadinessColor(result.readinessLevel) },
              ]}
            >
              {result.readinessLevel?.toUpperCase()} READINESS
            </Text>
          </View>
        </NeumorphicCard>

        {/* Target Markets */}
        <Text style={styles.sectionTitle}>Target Markets</Text>
        <View style={styles.marketsRow}>
          {result.targetMarkets.map((market, index) => (
            <View key={index} style={styles.marketTag}>
              <Globe size={14} color={neumorphicColors.primary[600]} />
              <Text style={styles.marketTagText}>{market}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {result.recommendations.map((rec, index) => (
              <NeumorphicCard
                key={index}
                style={styles.recommendationCard}
                animationDelay={index * 50}
              >
                <View style={styles.recommendationHeader}>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: `${getPriorityColor(rec.priority)}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(rec.priority) },
                      ]}
                    >
                      {rec.priority?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.recommendationCategory}>
                    {rec.category}
                  </Text>
                </View>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>
                  {rec.description}
                </Text>
              </NeumorphicCard>
            ))}
          </>
        )}

        {/* Market Requirements */}
        {result.marketRequirements && result.marketRequirements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Market Requirements</Text>
            {result.marketRequirements.map((market, index) => (
              <NeumorphicCard
                key={index}
                style={styles.marketCard}
                animationDelay={index * 50}
              >
                <View style={styles.marketHeader}>
                  <Globe size={20} color={neumorphicColors.primary[600]} />
                  <Text style={styles.marketName}>{market.market}</Text>
                </View>
                <View style={styles.requirementsList}>
                  {market.requirements.map((req, reqIndex) => (
                    <View key={reqIndex} style={styles.requirementItem}>
                      <Shield
                        size={14}
                        color={neumorphicColors.text.tertiary}
                      />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.timelineContainer}>
                  <TrendingUp
                    size={14}
                    color={neumorphicColors.semantic.info}
                  />
                  <Text style={styles.timelineText}>
                    Est. time to compliance: {market.estimatedTimeToCompliance}
                  </Text>
                </View>
              </NeumorphicCard>
            ))}
          </>
        )}

        {/* Next Steps */}
        {result.nextSteps && result.nextSteps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Next Steps</Text>
            <NeumorphicCard style={styles.stepsCard}>
              {result.nextSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </NeumorphicCard>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <NeumorphicButton
            title="View Document Templates"
            variant="secondary"
            size="large"
            icon={<FileText size={20} color={neumorphicColors.primary[600]} />}
            onPress={() => router.push("/export/documents" as any)}
            fullWidth
          />

          <NeumorphicButton
            title="Find Logistics Partners"
            variant="primary"
            size="large"
            icon={<Truck size={20} color={neumorphicColors.text.inverse} />}
            style={{ marginTop: spacing.md }}
            onPress={() => router.push("/export/logistics" as any)}
            fullWidth
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  title: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  placeholder: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  scoreCard: {
    alignItems: "center",
    padding: spacing.xl,
  },
  productType: {
    ...typography.h5,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.md,
  },
  scoreContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
  },
  scoreLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  readinessBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  readinessText: {
    ...typography.caption,
    fontWeight: "700",
  },
  sectionTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  marketsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  marketTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.full,
  },
  marketTagText: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[600],
    fontWeight: "500",
  },
  recommendationCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: "700",
  },
  recommendationCategory: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    textTransform: "uppercase",
  },
  recommendationTitle: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  recommendationDescription: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    lineHeight: 20,
  },
  marketCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  marketHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  marketName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  requirementsList: {
    gap: spacing.sm,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  requirementText: {
    flex: 1,
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    lineHeight: 20,
  },
  timelineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  timelineText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.info,
  },
  stepsCard: {
    padding: spacing.lg,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: neumorphicColors.primary[600],
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: neumorphicColors.text.inverse,
  },
  stepText: {
    flex: 1,
    ...typography.body,
    color: neumorphicColors.text.primary,
    lineHeight: 24,
  },
  actions: {
    marginTop: spacing.xl,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

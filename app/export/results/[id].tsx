import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import AnimatedCard from "../../../src/components/AnimatedCard";
import AnimatedButton from "../../../src/components/AnimatedButton";
import GlassCard from "../../../src/components/GlassCard";
import { theme } from "../../../src/theme/tokens";
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
        return theme.colors.success;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return <CheckCircle size={32} color={theme.colors.success} />;
      case "medium":
        return <AlertTriangle size={32} color={theme.colors.warning} />;
      case "low":
        return <XCircle size={32} color={theme.colors.error} />;
      default:
        return <AlertTriangle size={32} color={theme.colors.text.secondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return theme.colors.error;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Assessment Results</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <XCircle
            size={64}
            color={theme.colors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Results Not Found</Text>
          <Text style={styles.errorSubtitle}>
            Unable to load your assessment results.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Assessment Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <GlassCard style={styles.scoreCard}>
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
        </GlassCard>

        {/* Target Markets */}
        <Text style={styles.sectionTitle}>Target Markets</Text>
        <View style={styles.marketsRow}>
          {result.targetMarkets.map((market, index) => (
            <View key={index} style={styles.marketTag}>
              <Globe size={14} color={theme.colors.primary[600]} />
              <Text style={styles.marketTagText}>{market}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {result.recommendations.map((rec, index) => (
              <AnimatedCard
                key={index}
                style={styles.recommendationCard}
                delay={index * 50}
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
              </AnimatedCard>
            ))}
          </>
        )}

        {/* Market Requirements */}
        {result.marketRequirements && result.marketRequirements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Market Requirements</Text>
            {result.marketRequirements.map((market, index) => (
              <AnimatedCard
                key={index}
                style={styles.marketCard}
                delay={index * 50}
              >
                <View style={styles.marketHeader}>
                  <Globe size={20} color={theme.colors.primary[600]} />
                  <Text style={styles.marketName}>{market.market}</Text>
                </View>
                <View style={styles.requirementsList}>
                  {market.requirements.map((req, reqIndex) => (
                    <View key={reqIndex} style={styles.requirementItem}>
                      <Shield size={14} color={theme.colors.text.tertiary} />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.timelineContainer}>
                  <TrendingUp size={14} color={theme.colors.info} />
                  <Text style={styles.timelineText}>
                    Est. time to compliance: {market.estimatedTimeToCompliance}
                  </Text>
                </View>
              </AnimatedCard>
            ))}
          </>
        )}

        {/* Next Steps */}
        {result.nextSteps && result.nextSteps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Next Steps</Text>
            <AnimatedCard style={styles.stepsCard}>
              {result.nextSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </AnimatedCard>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AnimatedButton
            title="View Document Templates"
            variant="outline"
            size="lg"
            onPress={() => router.push("/export/documents" as any)}
          >
            <FileText size={20} color={theme.colors.primary[600]} />
          </AnimatedButton>

          <AnimatedButton
            title="Find Logistics Partners"
            variant="primary"
            size="lg"
            style={{ marginTop: theme.spacing.md }}
            onPress={() => router.push("/export/logistics" as any)}
          >
            <Truck size={20} color={theme.colors.text.inverse} />
          </AnimatedButton>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  scoreCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  productType: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  scoreContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  readinessBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  readinessText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  marketsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  marketTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.full,
  },
  marketTagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  recommendationCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  priorityText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  recommendationCategory: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
  },
  recommendationTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  recommendationDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  marketCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  marketHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  marketName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  requirementsList: {
    gap: theme.spacing.sm,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  requirementText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  timelineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  timelineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.info,
  },
  stepsCard: {
    padding: theme.spacing.lg,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  stepText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  bottomPadding: {
    height: theme.spacing["2xl"],
  },
});

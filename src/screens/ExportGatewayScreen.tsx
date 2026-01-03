import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Globe,
  FileText,
  TrendingUp,
  Truck,
  CheckCircle,
  ChevronRight,
  BarChart3,
  ClipboardList,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import exportService from "../services/exportService";
import type { ExportAssessment, MarketIntelligence } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";
import GlassCard from "../components/GlassCard";

export default function ExportGatewayScreen() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<ExportAssessment[]>([]);
  const [marketData, setMarketData] = useState<MarketIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentsRes, marketRes] = await Promise.all([
        exportService
          .getAssessments()
          .catch(() => ({ data: { assessments: [] } })),
        exportService
          .getMarketIntelligence()
          .catch(() => ({ data: { markets: [] } })),
      ]);
      setAssessments(assessmentsRes.data?.assessments || []);
      setMarketData(marketRes.data?.markets || []);
    } catch (error) {
      console.error("Failed to load export data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const features = [
    {
      icon: ClipboardList,
      title: "Export Assessment",
      description: "Evaluate your export readiness",
      color: theme.colors.primary[600],
      route: "/export/assessment",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Global market prices & trends",
      color: theme.colors.secondary[600],
      route: "/export/market-intelligence",
    },
    {
      icon: FileText,
      title: "Document Templates",
      description: "Required export documentation",
      color: theme.colors.info,
      route: "/export/documents",
    },
    {
      icon: Truck,
      title: "Logistics Partners",
      description: "Shipping & freight services",
      color: theme.colors.warning,
      route: "/export/logistics",
    },
  ];

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

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[600]]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Globe size={28} color={theme.colors.primary[600]} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Export Gateway</Text>
            <Text style={styles.subtitle}>
              Take your products to global markets
            </Text>
          </View>
        </View>

        {/* Hero Card */}
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Ready to Export?</Text>
            <Text style={styles.heroText}>
              Get personalized guidance on exporting your agricultural products
              to international markets
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push("/export/assessment")}
            >
              <Text style={styles.heroButtonText}>Start Assessment</Text>
              <ChevronRight size={20} color={theme.colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Feature Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Services</Text>
          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                style={styles.featureCard}
                delay={index * 100}
                onPress={() => router.push(feature.route)}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + "15" },
                  ]}
                >
                  <feature.icon size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* Recent Assessments */}
        {assessments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Assessments</Text>
              <TouchableOpacity
                onPress={() => router.push("/export/assessments")}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {assessments.slice(0, 3).map((assessment) => (
              <AnimatedCard
                key={assessment.id}
                style={styles.assessmentCard}
                onPress={() =>
                  router.push(`/export/assessment/${assessment.id}`)
                }
              >
                <View style={styles.assessmentHeader}>
                  <View>
                    <Text style={styles.assessmentProduct}>
                      {assessment.productType}
                    </Text>
                    <Text style={styles.assessmentMarkets}>
                      Markets: {assessment.targetMarkets?.join(", ") || "N/A"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.readinessBadge,
                      {
                        backgroundColor:
                          getReadinessColor(assessment.readinessLevel) + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readinessText,
                        { color: getReadinessColor(assessment.readinessLevel) },
                      ]}
                    >
                      {assessment.readinessLevel || "Pending"}
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreBar}>
                    <View
                      style={[
                        styles.scoreProgress,
                        {
                          width: `${parseFloat(
                            assessment.overallScore || "0"
                          )}%`,
                          backgroundColor: getReadinessColor(
                            assessment.readinessLevel
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreText}>
                    {assessment.overallScore || "0"}% Ready
                  </Text>
                </View>
              </AnimatedCard>
            ))}
          </View>
        )}

        {/* Market Insights */}
        {marketData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Insights</Text>
              <TouchableOpacity
                onPress={() => router.push("/export/market-intelligence")}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.marketScroll}
            >
              {marketData.slice(0, 5).map((market) => (
                <AnimatedCard key={market.id} style={styles.marketCard}>
                  <Text style={styles.marketName}>{market.market}</Text>
                  <Text style={styles.marketCategory}>
                    {market.productCategory}
                  </Text>
                  <View style={styles.marketPrice}>
                    <Text style={styles.marketPriceValue}>
                      ${market.averagePrice}
                    </Text>
                    <Text style={styles.marketPriceUnit}>
                      /{market.priceUnit}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.trendBadge,
                      {
                        backgroundColor:
                          market.priceTrend === "up"
                            ? theme.colors.success + "15"
                            : market.priceTrend === "down"
                            ? theme.colors.error + "15"
                            : theme.colors.neutral[100],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color:
                            market.priceTrend === "up"
                              ? theme.colors.success
                              : market.priceTrend === "down"
                              ? theme.colors.error
                              : theme.colors.text.secondary,
                        },
                      ]}
                    >
                      {market.priceTrend === "up"
                        ? "↑ Rising"
                        : market.priceTrend === "down"
                        ? "↓ Falling"
                        : "→ Stable"}
                    </Text>
                  </View>
                </AnimatedCard>
              ))}
            </ScrollView>
          </View>
        )}

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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  heroCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary[600],
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    textAlign: "center",
  },
  heroText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.text.inverse,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  heroButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  featureCard: {
    width: "47%",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  assessmentCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  assessmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assessmentProduct: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  assessmentMarkets: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  readinessBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  readinessText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  scoreContainer: {
    marginTop: theme.spacing.md,
  },
  scoreBar: {
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    borderRadius: 4,
  },
  scoreText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    textAlign: "right",
  },
  marketScroll: {
    gap: theme.spacing.md,
  },
  marketCard: {
    width: 160,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
  },
  marketName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  marketCategory: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  marketPrice: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: theme.spacing.md,
  },
  marketPriceValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  marketPriceUnit: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  trendBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  bottomPadding: {
    height: theme.spacing["3xl"],
  },
});

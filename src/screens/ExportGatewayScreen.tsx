import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Globe,
  FileText,
  TrendingUp,
  Truck,
  ChevronRight,
  ClipboardList,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import exportService from "../services/exportService";
import type { ExportAssessment, MarketIntelligence } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";

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
      color: neumorphicColors.primary[600],
      route: "/export/assessment",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Global market prices & trends",
      color: neumorphicColors.secondary[600],
      route: "/export/market-intelligence",
    },
    {
      icon: FileText,
      title: "Document Templates",
      description: "Required export documentation",
      color: neumorphicColors.semantic.info,
      route: "/export/documents",
    },
    {
      icon: Truck,
      title: "Logistics Partners",
      description: "Shipping & freight services",
      color: neumorphicColors.semantic.warning,
      route: "/export/logistics",
    },
  ];

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

  if (loading && !refreshing) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={true}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Globe size={28} color={neumorphicColors.primary[600]} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Export Gateway</Text>
            <Text style={styles.subtitle}>
              Take your products to global markets
            </Text>
          </View>
        </View>

        {/* Hero Card */}
        <NeumorphicCard variant="elevated" style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Ready to Export?</Text>
            <Text style={styles.heroText}>
              Get personalized guidance on exporting your agricultural products
              to international markets
            </Text>
            <NeumorphicButton
              title="Start Assessment"
              variant="secondary"
              onPress={() => router.push("/export/assessment")}
              icon={
                <ChevronRight size={20} color={neumorphicColors.primary[600]} />
              }
              iconPosition="right"
              style={styles.heroButton}
            />
          </View>
        </NeumorphicCard>

        {/* Feature Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Services</Text>
          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <NeumorphicCard
                key={index}
                style={styles.featureCard}
                animationDelay={index * 100}
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
              </NeumorphicCard>
            ))}
          </View>
        </View>

        {/* Recent Assessments */}
        {assessments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Assessments</Text>
              <NeumorphicButton
                title="See All"
                variant="tertiary"
                size="small"
                onPress={() => router.push("/export/assessments")}
              />
            </View>
            {assessments.slice(0, 3).map((assessment) => (
              <NeumorphicCard
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
              </NeumorphicCard>
            ))}
          </View>
        )}

        {/* Market Insights */}
        {marketData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Insights</Text>
              <NeumorphicButton
                title="See All"
                variant="tertiary"
                size="small"
                onPress={() => router.push("/export/market-intelligence")}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.marketScroll}
            >
              {marketData.slice(0, 5).map((market) => (
                <NeumorphicCard key={market.id} style={styles.marketCard}>
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
                            ? neumorphicColors.semantic.success + "15"
                            : market.priceTrend === "down"
                            ? neumorphicColors.semantic.error + "15"
                            : neumorphicColors.base.input,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color:
                            market.priceTrend === "up"
                              ? neumorphicColors.semantic.success
                              : market.priceTrend === "down"
                              ? neumorphicColors.semantic.error
                              : neumorphicColors.text.secondary,
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
                </NeumorphicCard>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: neumorphicColors.primary[600],
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    ...typography.h4,
    color: neumorphicColors.text.inverse,
    textAlign: "center",
  },
  heroText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.inverse,
    opacity: 0.9,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  heroButton: {
    marginTop: spacing.lg,
    backgroundColor: neumorphicColors.text.inverse,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  featureCard: {
    width: "47%",
    padding: spacing.lg,
    alignItems: "center",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  featureTitle: {
    ...typography.h6,
    textAlign: "center",
  },
  featureDescription: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  assessmentCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  assessmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assessmentProduct: {
    ...typography.h6,
  },
  assessmentMarkets: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  readinessBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  readinessText: {
    ...typography.caption,
    fontWeight: "600",
  },
  scoreContainer: {
    marginTop: spacing.md,
  },
  scoreBar: {
    height: 8,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.xs,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    borderRadius: borderRadius.xs,
  },
  scoreText: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  marketScroll: {
    gap: spacing.md,
  },
  marketCard: {
    width: 160,
    padding: spacing.lg,
  },
  marketName: {
    ...typography.h6,
    fontWeight: "700",
  },
  marketCategory: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  marketPrice: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.md,
  },
  marketPriceValue: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
  },
  marketPriceUnit: {
    ...typography.caption,
  },
  trendBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  trendText: {
    ...typography.caption,
    fontWeight: "500",
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

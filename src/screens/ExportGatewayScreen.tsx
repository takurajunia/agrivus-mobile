import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SERVICE_CARD_SIZE = (SCREEN_WIDTH - 64) / 4;

// Export Service Card Component with proper proportions and animations
interface ServiceCardProps {
  icon: React.ComponentType<any>;
  title: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  color,
  bgColor,
  onPress,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 300 + index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 300 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.serviceCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.serviceCardTouchable}
      >
        <View
          style={[styles.serviceIconContainer, { backgroundColor: bgColor }]}
        >
          <Icon size={24} color={color} strokeWidth={2} />
        </View>
        <Text style={styles.serviceCardLabel} numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
      title: "Assessment",
      color: neumorphicColors.primary[600],
      bgColor: neumorphicColors.primary[50],
      route: "/export/assessment",
    },
    {
      icon: TrendingUp,
      title: "Markets",
      color: neumorphicColors.secondary[600],
      bgColor: neumorphicColors.secondary[50],
      route: "/export/market-intelligence",
    },
    {
      icon: FileText,
      title: "Documents",
      color: neumorphicColors.semantic.info,
      bgColor: "#E3F2FD",
      route: "/export/documents",
    },
    {
      icon: Truck,
      title: "Logistics",
      color: neumorphicColors.semantic.warning,
      bgColor: "#FFF3E0",
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

        {/* Export Services - Redesigned */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Export Services</Text>
          <View style={styles.servicesContainer}>
            {features.map((feature, index) => (
              <ServiceCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                color={feature.color}
                bgColor={feature.bgColor}
                onPress={() => router.push(feature.route)}
                index={index}
              />
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
    marginBottom: spacing.md,
  },
  // Export Services - New Compact Design
  servicesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  servicesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceCardWrapper: {
    alignItems: "center",
    width: SERVICE_CARD_SIZE,
  },
  serviceCardTouchable: {
    alignItems: "center",
    width: "100%",
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    shadowColor: neumorphicColors.base.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginTop: 2,
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

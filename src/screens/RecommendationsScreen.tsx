import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Sparkles, TrendingUp } from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
} from "../components/neumorphic";
import LoadingSpinner from "../components/LoadingSpinner";
import RecommendationCard from "../components/RecommendationCard";
import MarketInsightCard from "../components/MarketInsightCard";
import recommendationsService from "../services/recommendationsService";
import type {
  Recommendation,
  MarketInsight,
} from "../services/recommendationsService";

type TabType = "recommendations" | "insights";
type FilterType = "all" | "active" | "accepted";

export default function RecommendationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("recommendations");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<FilterType>("active");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recsResponse, insightsResponse] = await Promise.all([
        recommendationsService.getRecommendations({
          status: filter === "all" ? undefined : filter,
          limit: 50,
        }),
        recommendationsService.getMarketInsights({ limit: 20 }),
      ]);

      setRecommendations(recsResponse.data.recommendations);
      setMarketInsights(insightsResponse.data.insights);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      Alert.alert("Error", "Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleGenerateRecommendations = async () => {
    try {
      setGenerating(true);
      await recommendationsService.generateRecommendations();
      await loadData();
      Alert.alert("Success", "✅ New recommendations generated!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to generate recommendations",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await recommendationsService.acceptRecommendation(id);
      await loadData();
      Alert.alert("Success", "✓ Recommendation accepted!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept recommendation",
      );
    }
  };

  const handleReject = async (id: string) => {
    try {
      await recommendationsService.rejectRecommendation(id);
      await loadData();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reject recommendation",
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <NeumorphicScreen>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={neumorphicColors.primary[600]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Sparkles
                size={28}
                color={neumorphicColors.primary[600]}
                style={styles.titleIcon}
              />
              <Text style={styles.title}>AI Recommendations</Text>
            </View>
            <Text style={styles.subtitle}>
              Personalized insights to grow your farming business
            </Text>
          </View>

          <NeumorphicButton
            title={generating ? "Generating..." : "🔄 Generate New"}
            onPress={handleGenerateRecommendations}
            disabled={generating}
            loading={generating}
            variant="primary"
            size="small"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "recommendations" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("recommendations")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "recommendations" && styles.tabTextActive,
              ]}
            >
              💡 Recommendations ({recommendations.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "insights" && styles.tabActive]}
            onPress={() => setActiveTab("insights")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "insights" && styles.tabTextActive,
              ]}
            >
              📊 Market Insights ({marketInsights.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <>
            {/* Filters */}
            <View style={styles.filtersRow}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "active" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("active")}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === "active" && styles.filterTextActive,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "accepted" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("accepted")}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === "accepted" && styles.filterTextActive,
                  ]}
                >
                  Accepted
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "all" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("all")}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === "all" && styles.filterTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recommendations List */}
            {recommendations.length === 0 ? (
              <NeumorphicCard style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>💡</Text>
                <Text style={styles.emptyTitle}>No recommendations yet</Text>
                <Text style={styles.emptyText}>
                  Generate AI-powered recommendations to discover new
                  opportunities
                </Text>
                <NeumorphicButton
                  title={
                    generating ? "Generating..." : "Generate Recommendations"
                  }
                  onPress={handleGenerateRecommendations}
                  disabled={generating}
                  loading={generating}
                  variant="primary"
                  style={styles.emptyButton}
                />
              </NeumorphicCard>
            ) : (
              <View style={styles.listContainer}>
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Market Insights Tab */}
        {activeTab === "insights" && (
          <>
            {marketInsights.length === 0 ? (
              <NeumorphicCard style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>
                  No market insights available
                </Text>
                <Text style={styles.emptyText}>
                  Market insights will appear as transaction data accumulates
                </Text>
              </NeumorphicCard>
            ) : (
              <View style={styles.listContainer}>
                {marketInsights.map((insight) => (
                  <MarketInsightCard key={insight.id} insight={insight} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.shadowDark,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: neumorphicColors.primary[600],
  },
  tabText: {
    ...typography.h5,
    color: neumorphicColors.text.secondary,
  },
  tabTextActive: {
    color: neumorphicColors.primary[600],
    fontWeight: "700",
  },
  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: neumorphicColors.base.input,
  },
  filterButtonActive: {
    backgroundColor: neumorphicColors.primary[600],
  },
  filterText: {
    ...typography.h5,
    color: neumorphicColors.text.secondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContainer: {
    gap: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});

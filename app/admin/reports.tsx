import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  ArrowUpRight,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import GlassCard from "../../src/components/GlassCard";
import { theme } from "../../src/theme/tokens";
import adminService, { RevenueReport } from "../../src/services/adminService";

type TimePeriod = "week" | "month" | "quarter" | "year";
type ExportFormat = "csv" | "pdf" | "excel";

const screenWidth = Dimensions.get("window").width;

export default function AdminReportsScreen() {
  const router = useRouter();
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [exporting, setExporting] = useState(false);

  const periodTabs: { key: TimePeriod; label: string }[] = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "quarter", label: "Quarter" },
    { key: "year", label: "Year" },
  ];

  const fetchReport = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        }

        const response = await adminService.getRevenueReport(timePeriod);

        if (response.success) {
          setReport(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch revenue report:", error);
        Alert.alert("Error", "Failed to load revenue report");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timePeriod]
  );

  useEffect(() => {
    setLoading(true);
    fetchReport();
  }, [timePeriod]);

  const handleRefresh = useCallback(() => {
    fetchReport(true);
  }, [fetchReport]);

  const handleExport = async (format: ExportFormat) => {
    try {
      setExporting(true);
      const response = await adminService.exportData("revenue", format, {
        period: timePeriod,
      });

      if (response.success) {
        Alert.alert("Success", `Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Failed to export report:", error);
      Alert.alert("Error", "Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const renderMetricCard = (
    label: string,
    value: number,
    change: number,
    isCurrency: boolean = true
  ) => (
    <GlassCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {isCurrency ? formatCurrency(value) : value.toLocaleString()}
      </Text>
      <View style={styles.changeContainer}>
        {change >= 0 ? (
          <TrendingUp size={14} color={theme.colors.success} />
        ) : (
          <TrendingDown size={14} color={theme.colors.error} />
        )}
        <Text
          style={[
            styles.changeText,
            { color: change >= 0 ? theme.colors.success : theme.colors.error },
          ]}
        >
          {formatPercentage(change)}
        </Text>
      </View>
    </GlassCard>
  );

  const renderBreakdownItem = (
    label: string,
    value: number,
    total: number,
    color: string
  ) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={styles.breakdownItem}>
        <View style={styles.breakdownHeader}>
          <View style={styles.breakdownLabel}>
            <View style={[styles.colorDot, { backgroundColor: color }]} />
            <Text style={styles.breakdownLabelText}>{label}</Text>
          </View>
          <Text style={styles.breakdownValue}>{formatCurrency(value)}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  const renderTopProduct = (product: any, index: number) => (
    <AnimatedCard
      key={product.id || index}
      style={styles.productCard}
      delay={index * 50}
    >
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productCategory}>{product.category}</Text>
      </View>
      <View style={styles.productStats}>
        <Text style={styles.productRevenue}>
          {formatCurrency(product.revenue)}
        </Text>
        <Text style={styles.productSales}>{product.sales} sales</Text>
      </View>
    </AnimatedCard>
  );

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
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => {
            Alert.alert("Export Report", "Choose export format", [
              { text: "CSV", onPress: () => handleExport("csv") },
              { text: "PDF", onPress: () => handleExport("pdf") },
              { text: "Excel", onPress: () => handleExport("excel") },
              { text: "Cancel", style: "cancel" },
            ]);
          }}
        >
          <Download size={24} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {/* Period Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {periodTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, timePeriod === tab.key && styles.activeTab]}
            onPress={() => setTimePeriod(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                timePeriod === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary[600]]}
              tintColor={theme.colors.primary[600]}
            />
          }
        >
          {/* Key Metrics */}
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              "Total Revenue",
              report?.totalRevenue || 0,
              report?.revenueChange || 0
            )}
            {renderMetricCard(
              "Platform Fees",
              report?.platformFees || 0,
              report?.feesChange || 0
            )}
            {renderMetricCard(
              "Orders",
              report?.totalOrders || 0,
              report?.ordersChange || 0,
              false
            )}
            {renderMetricCard(
              "Avg Order Value",
              report?.averageOrderValue || 0,
              report?.aovChange || 0
            )}
          </View>

          {/* Revenue Breakdown */}
          <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          <AnimatedCard style={styles.breakdownCard}>
            <View style={styles.breakdownChart}>
              <PieChart size={40} color={theme.colors.primary[600]} />
            </View>
            {renderBreakdownItem(
              "Marketplace Sales",
              parseFloat(report?.revenue?.marketplace || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              theme.colors.primary[600]
            )}
            {renderBreakdownItem(
              "Auction Sales",
              parseFloat(report?.revenue?.auctions || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              theme.colors.secondary[600]
            )}
            {renderBreakdownItem(
              "Export Gateway",
              parseFloat(report?.revenue?.exports || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              theme.colors.success
            )}
            {renderBreakdownItem(
              "AgriMall",
              parseFloat(report?.revenue?.agrimall || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              theme.colors.warning
            )}
          </AnimatedCard>

          {/* Growth Trends */}
          <Text style={styles.sectionTitle}>Growth Trends</Text>
          <AnimatedCard style={styles.trendsCard}>
            <View style={styles.trendHeader}>
              <BarChart3 size={24} color={theme.colors.primary[600]} />
              <Text style={styles.trendTitle}>Revenue Trend</Text>
            </View>

            {/* Simple bar chart representation */}
            <View style={styles.chartContainer}>
              {(report?.dailyRevenue || []).map((day: any, index: number) => {
                const maxValue = Math.max(
                  ...(report?.dailyRevenue || []).map((d: any) => d.value)
                );
                const height = maxValue > 0 ? (day.value / maxValue) * 100 : 0;
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={[styles.chartBar, { height: `${height}%` }]} />
                    <Text style={styles.chartLabel}>{day.label}</Text>
                  </View>
                );
              })}
              {(!report?.dailyRevenue || report.dailyRevenue.length === 0) && (
                <Text style={styles.noDataText}>No trend data available</Text>
              )}
            </View>
          </AnimatedCard>

          {/* Top Products */}
          <Text style={styles.sectionTitle}>Top Products</Text>
          {(report?.topProducts || []).length > 0 ? (
            report?.topProducts?.map((product: any, index: number) =>
              renderTopProduct(product, index)
            )
          ) : (
            <AnimatedCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No product data available</Text>
            </AnimatedCard>
          )}

          {/* Top Categories */}
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <AnimatedCard style={styles.categoriesCard}>
            {(report?.topCategories || []).length > 0 ? (
              report?.topCategories?.map((category: any, index: number) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryRank}>#{index + 1}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryRevenue}>
                      {formatCurrency(category.revenue)}
                    </Text>
                    <View style={styles.categoryTrend}>
                      <ArrowUpRight size={12} color={theme.colors.success} />
                      <Text style={styles.categoryChange}>
                        {formatPercentage(category.change)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No category data available</Text>
            )}
          </AnimatedCard>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {exporting && (
        <View style={styles.exportingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.exportingText}>Exporting report...</Text>
        </View>
      )}
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
  exportButton: {
    padding: theme.spacing.xs,
  },
  tabsContainer: {
    backgroundColor: theme.colors.background.primary,
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
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
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  metricCard: {
    width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    padding: theme.spacing.lg,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  changeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  breakdownCard: {
    padding: theme.spacing.lg,
  },
  breakdownChart: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  breakdownItem: {
    marginBottom: theme.spacing.lg,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  breakdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabelText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  breakdownValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    textAlign: "right",
  },
  trendsCard: {
    padding: theme.spacing.lg,
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  trendTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    paddingTop: theme.spacing.md,
  },
  chartBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 24,
    backgroundColor: theme.colors.primary[600],
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  noDataText: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.sm,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  rankNumber: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  productCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  productStats: {
    alignItems: "flex-end",
  },
  productRevenue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  productSales: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  categoriesCard: {
    padding: theme.spacing.lg,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  categoryRank: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    width: 24,
  },
  categoryName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  categoryStats: {
    alignItems: "flex-end",
  },
  categoryRevenue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  categoryTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  categoryChange: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: "center",
  },
  bottomPadding: {
    height: theme.spacing["2xl"],
  },
  exportingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  exportingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.inverse,
  },
});

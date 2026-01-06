import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../src/components/neumorphic/";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
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
    <NeumorphicCard style={styles.metricCard} variant="stat">
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {isCurrency ? formatCurrency(value) : value.toLocaleString()}
      </Text>
      <View style={styles.changeContainer}>
        {change >= 0 ? (
          <TrendingUp size={14} color={neumorphicColors.semantic.success} />
        ) : (
          <TrendingDown size={14} color={neumorphicColors.semantic.error} />
        )}
        <Text
          style={[
            styles.changeText,
            {
              color:
                change >= 0
                  ? neumorphicColors.semantic.success
                  : neumorphicColors.semantic.error,
            },
          ]}
        >
          {formatPercentage(change)}
        </Text>
      </View>
    </NeumorphicCard>
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
    <NeumorphicCard
      key={product.id || index}
      style={styles.productCard}
      animationDelay={index * 50}
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
    </NeumorphicCard>
  );

  return (
    <NeumorphicScreen leafPattern="dashboard">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <Text style={styles.title}>Reports</Text>
        <NeumorphicIconButton
          icon={<Download size={24} color={neumorphicColors.primary[600]} />}
          onPress={() => {
            Alert.alert("Export Report", "Choose export format", [
              { text: "CSV", onPress: () => handleExport("csv") },
              { text: "PDF", onPress: () => handleExport("pdf") },
              { text: "Excel", onPress: () => handleExport("excel") },
              { text: "Cancel", style: "cancel" },
            ]);
          }}
          variant="default"
          size="medium"
        />
      </View>

      {/* Period Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {periodTabs.map((tab) => (
          <NeumorphicButton
            key={tab.key}
            title={tab.label}
            onPress={() => setTimePeriod(tab.key)}
            variant={timePeriod === tab.key ? "primary" : "secondary"}
            size="small"
            style={styles.tabButton}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
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
              colors={[neumorphicColors.primary[600]]}
              tintColor={neumorphicColors.primary[600]}
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
          <NeumorphicCard style={styles.breakdownCard}>
            <View style={styles.breakdownChart}>
              <PieChart size={40} color={neumorphicColors.primary[600]} />
            </View>
            {renderBreakdownItem(
              "Marketplace Sales",
              parseFloat(report?.revenue?.marketplace || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              neumorphicColors.primary[600]
            )}
            {renderBreakdownItem(
              "Auction Sales",
              parseFloat(report?.revenue?.auctions || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              neumorphicColors.secondary[600]
            )}
            {renderBreakdownItem(
              "Export Gateway",
              parseFloat(report?.revenue?.exports || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              neumorphicColors.semantic.success
            )}
            {renderBreakdownItem(
              "AgriMall",
              parseFloat(report?.revenue?.agrimall || "0"),
              report?.totalRevenue || parseFloat(report?.revenue?.total || "1"),
              neumorphicColors.semantic.warning
            )}
          </NeumorphicCard>

          {/* Growth Trends */}
          <Text style={styles.sectionTitle}>Growth Trends</Text>
          <NeumorphicCard style={styles.trendsCard}>
            <View style={styles.trendHeader}>
              <BarChart3 size={24} color={neumorphicColors.primary[600]} />
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
          </NeumorphicCard>

          {/* Top Products */}
          <Text style={styles.sectionTitle}>Top Products</Text>
          {(report?.topProducts || []).length > 0 ? (
            report?.topProducts?.map((product: any, index: number) =>
              renderTopProduct(product, index)
            )
          ) : (
            <NeumorphicCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No product data available</Text>
            </NeumorphicCard>
          )}

          {/* Top Categories */}
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <NeumorphicCard style={styles.categoriesCard}>
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
                      <ArrowUpRight
                        size={12}
                        color={neumorphicColors.semantic.success}
                      />
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
          </NeumorphicCard>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {exporting && (
        <View style={styles.exportingOverlay}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.exportingText}>Exporting report...</Text>
        </View>
      )}
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
  },
  title: {
    ...typography.h4,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
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
  sectionTitle: {
    ...typography.h5,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricCard: {
    width: (screenWidth - spacing.lg * 2 - spacing.md) / 2,
    padding: spacing.lg,
  },
  metricLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  changeText: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  breakdownCard: {
    padding: spacing.lg,
  },
  breakdownChart: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  breakdownItem: {
    marginBottom: spacing.lg,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabelText: {
    ...typography.bodySmall,
  },
  breakdownValue: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.xs,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: borderRadius.xs,
  },
  percentageText: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  trendsCard: {
    padding: spacing.lg,
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  trendTitle: {
    ...typography.h6,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    paddingTop: spacing.md,
  },
  chartBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 24,
    backgroundColor: neumorphicColors.primary[600],
    borderRadius: borderRadius.xs,
    minHeight: 4,
  },
  chartLabel: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  noDataText: {
    flex: 1,
    textAlign: "center",
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  rankNumber: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: neumorphicColors.primary[600],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  productCategory: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  productStats: {
    alignItems: "flex-end",
  },
  productRevenue: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.semantic.success,
  },
  productSales: {
    ...typography.caption,
  },
  categoriesCard: {
    padding: spacing.lg,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.input,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  categoryRank: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: neumorphicColors.primary[600],
    width: 24,
  },
  categoryName: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  categoryStats: {
    alignItems: "flex-end",
  },
  categoryRevenue: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  categoryTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  categoryChange: {
    ...typography.caption,
    color: neumorphicColors.semantic.success,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  exportingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  exportingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.inverse,
  },
});

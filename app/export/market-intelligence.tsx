import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Globe,
  Search,
  ChevronRight,
  DollarSign,
  Package,
  BarChart3,
  Filter,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import ModernInput from "../../src/components/ModernInput";
import GlassCard from "../../src/components/GlassCard";
import { theme } from "../../src/theme/tokens";
import exportService from "../../src/services/exportService";

interface MarketData {
  id: string;
  market: string;
  marketFlag: string;
  products: {
    name: string;
    category: string;
    currentPrice: number;
    priceUnit: string;
    priceChange: number;
    trend: "up" | "down" | "stable";
    demand: "high" | "medium" | "low";
    seasonality: string;
  }[];
  currency: string;
  lastUpdated: string;
}

const MARKETS = [
  { key: "all", label: "All Markets", flag: "🌍" },
  { key: "eu", label: "European Union", flag: "🇪🇺" },
  { key: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { key: "us", label: "United States", flag: "🇺🇸" },
  { key: "uae", label: "UAE", flag: "🇦🇪" },
  { key: "china", label: "China", flag: "🇨🇳" },
];

const screenWidth = Dimensions.get("window").width;

export default function ExportMarketIntelligenceScreen() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("all");

  useEffect(() => {
    fetchMarketData();
  }, [selectedMarket]);

  const fetchMarketData = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const params: any = {};
      if (selectedMarket !== "all") {
        params.market = selectedMarket;
      }

      const response = await exportService.getMarketIntelligence(params);
      if (response.success) {
        setMarketData(response.data.markets || []);
      }
    } catch (error) {
      console.error("Failed to fetch market intelligence:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMarketData(true);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={14} color={theme.colors.success} />;
      case "down":
        return <TrendingDown size={14} color={theme.colors.error} />;
      default:
        return <BarChart3 size={14} color={theme.colors.text.tertiary} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return theme.colors.success;
      case "down":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high":
        return theme.colors.success;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      AED: "د.إ",
      CNY: "¥",
    };
    return `${symbols[currency] || "$"}${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  // Flatten all products for filtering
  const allProducts = marketData.flatMap((market) =>
    market.products.map((product) => ({
      ...product,
      market: market.market,
      marketFlag: market.marketFlag,
      currency: market.currency,
    }))
  );

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = (product: any, index: number) => (
    <AnimatedCard
      key={`${product.market}-${product.name}-${index}`}
      style={styles.productCard}
      delay={index * 50}
    >
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        <View style={styles.marketBadge}>
          <Text style={styles.marketFlag}>{product.marketFlag}</Text>
          <Text style={styles.marketName}>{product.market}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceMain}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(product.currentPrice, product.currency)}
            <Text style={styles.priceUnit}>/{product.priceUnit}</Text>
          </Text>
        </View>
        <View style={styles.priceChange}>
          {getTrendIcon(product.trend)}
          <Text
            style={[
              styles.changeValue,
              { color: getTrendColor(product.trend) },
            ]}
          >
            {formatPercentage(product.priceChange)}
          </Text>
        </View>
      </View>

      <View style={styles.productFooter}>
        <View style={styles.demandContainer}>
          <Text style={styles.footerLabel}>Demand</Text>
          <View
            style={[
              styles.demandBadge,
              { backgroundColor: `${getDemandColor(product.demand)}15` },
            ]}
          >
            <Text
              style={[
                styles.demandText,
                { color: getDemandColor(product.demand) },
              ]}
            >
              {product.demand?.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.seasonContainer}>
          <Text style={styles.footerLabel}>Season</Text>
          <Text style={styles.seasonText}>{product.seasonality}</Text>
        </View>
      </View>
    </AnimatedCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading market data...</Text>
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
        <Text style={styles.title}>Market Intelligence</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
        />
      </View>

      {/* Market Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {MARKETS.map((market) => (
          <TouchableOpacity
            key={market.key}
            style={[
              styles.tab,
              selectedMarket === market.key && styles.activeTab,
            ]}
            onPress={() => setSelectedMarket(market.key)}
          >
            <Text style={styles.tabFlag}>{market.flag}</Text>
            <Text
              style={[
                styles.tabText,
                selectedMarket === market.key && styles.activeTabText,
              ]}
            >
              {market.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Market Overview */}
      <GlassCard style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Globe size={20} color={theme.colors.primary[600]} />
          <Text style={styles.overviewTitle}>Market Overview</Text>
        </View>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {filteredProducts.length}
            </Text>
            <Text style={styles.overviewStatLabel}>Products</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {filteredProducts.filter((p) => p.trend === "up").length}
            </Text>
            <Text style={styles.overviewStatLabel}>Trending Up</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {filteredProducts.filter((p) => p.demand === "high").length}
            </Text>
            <Text style={styles.overviewStatLabel}>High Demand</Text>
          </View>
        </View>
      </GlassCard>

      {/* Products List */}
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
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <BarChart3
              size={64}
              color={theme.colors.text.tertiary}
              strokeWidth={1}
            />
            <Text style={styles.emptyTitle}>No Market Data</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Market data will appear here"}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product, index) =>
            renderProduct(product, index)
          )
        )}
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
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  tabsContainer: {
    backgroundColor: theme.colors.background.primary,
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabFlag: {
    fontSize: 16,
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  overviewCard: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  overviewTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overviewStat: {
    alignItems: "center",
  },
  overviewStatValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  overviewStatLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
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
  productCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  productCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  marketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
  },
  marketFlag: {
    fontSize: 14,
  },
  marketName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  priceMain: {},
  priceLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  priceUnit: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.tertiary,
  },
  priceChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  changeValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  demandContainer: {},
  footerLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  demandBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  demandText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  seasonContainer: {},
  seasonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});

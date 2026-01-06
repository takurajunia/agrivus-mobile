import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicIconButton,
  NeumorphicSearchBar,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
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
        return (
          <TrendingUp size={14} color={neumorphicColors.semantic.success} />
        );
      case "down":
        return (
          <TrendingDown size={14} color={neumorphicColors.semantic.error} />
        );
      default:
        return <BarChart3 size={14} color={neumorphicColors.text.tertiary} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return neumorphicColors.semantic.success;
      case "down":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high":
        return neumorphicColors.semantic.success;
      case "medium":
        return neumorphicColors.semantic.warning;
      case "low":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
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
    <NeumorphicCard
      key={`${product.market}-${product.name}-${index}`}
      style={styles.productCard}
      animationDelay={index * 50}
      variant="standard"
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
    </NeumorphicCard>
  );

  if (loading) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <Text style={styles.title}>Market Intelligence</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
            activeOpacity={0.7}
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
      <NeumorphicCard style={styles.overviewCard} variant="elevated">
        <View style={styles.overviewHeader}>
          <Globe size={20} color={neumorphicColors.primary[600]} />
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
      </NeumorphicCard>

      {/* Products List */}
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
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <BarChart3
              size={64}
              color={neumorphicColors.text.tertiary}
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  tabsContainer: {
    backgroundColor: neumorphicColors.base.background,
    maxHeight: 70,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.card,
    marginRight: spacing.sm,
    ...getNeumorphicShadow(1),
  },
  activeTab: {
    backgroundColor: neumorphicColors.primary[600],
  },
  tabFlag: {
    fontSize: 16,
  },
  tabText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  activeTabText: {
    color: neumorphicColors.text.inverse,
  },
  overviewCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  overviewTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overviewStat: {
    alignItems: "center",
  },
  overviewStatValue: {
    ...typography.h3,
    color: neumorphicColors.primary[600],
  },
  overviewStatLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
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
  productCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  productCategory: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  marketBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.full,
  },
  marketFlag: {
    fontSize: 14,
  },
  marketName: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.pressed,
  },
  priceMain: {},
  priceLabel: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginBottom: 2,
  },
  priceValue: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  priceUnit: {
    ...typography.bodySmall,
    fontWeight: "400",
    color: neumorphicColors.text.tertiary,
  },
  priceChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  changeValue: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  demandContainer: {},
  footerLabel: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginBottom: spacing.xs,
  },
  demandBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  demandText: {
    ...typography.caption,
    fontWeight: "700",
  },
  seasonContainer: {},
  seasonText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
});

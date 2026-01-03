import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShoppingBag,
  Filter,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";
import { agrimallService } from "../../src/services/agrimallService";
import { useAuth } from "../../src/contexts/AuthContext";

interface AgrimallOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
  };
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AgriMallOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<AgrimallOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOrders = useCallback(
    async (refresh = false, loadMore = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setPage(1);
        } else if (loadMore) {
          setLoadingMore(true);
        }

        const currentPage = loadMore ? page + 1 : 1;
        const params: any = {
          page: currentPage,
          limit: 20,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const response = await agrimallService.getOrders(params);

        const fetchedOrders = response.orders || response.data || [];

        if (loadMore) {
          setOrders((prev) => [...prev, ...fetchedOrders]);
          setPage(currentPage);
        } else {
          setOrders(fetchedOrders);
        }

        setHasMore(fetchedOrders.length === 20);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, page]
  );

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleRefresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchOrders(false, true);
    }
  }, [fetchOrders, hasMore, loadingMore]);

  const handleOrderPress = (orderId: string) => {
    router.push(`/agrimall/order/${orderId}` as any);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return theme.colors.text.tertiary;
      case "paid":
        return theme.colors.info;
      case "processing":
        return theme.colors.warning;
      case "ready_for_pickup":
        return theme.colors.secondary[600];
      case "shipped":
      case "in_transit":
        return theme.colors.primary[600];
      case "delivered":
      case "confirmed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={18} color={color} />;
      case "processing":
        return <Package size={18} color={color} />;
      case "shipped":
      case "in_transit":
        return <Truck size={18} color={color} />;
      case "delivered":
      case "confirmed":
        return <CheckCircle size={18} color={color} />;
      case "cancelled":
        return <XCircle size={18} color={color} />;
      default:
        return <Clock size={18} color={color} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderOrderItem = ({ item }: { item: AgrimallOrder }) => (
    <AnimatedCard
      style={styles.orderCard}
      onPress={() => handleOrderPress(item.id)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          {getStatusIcon(item.status)}
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status?.replace(/_/g, " ")}
          </Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Package size={20} color={theme.colors.primary[600]} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.product?.name}</Text>
          <Text style={styles.productQuantity}>
            {item.quantity} {item.product?.unit}
          </Text>
        </View>
        <Text style={styles.orderTotal}>
          {formatCurrency(item.totalAmount)}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.viewDetails}>View Details</Text>
        <ChevronRight size={18} color={theme.colors.primary[600]} />
      </View>
    </AnimatedCard>
  );

  const renderFilterChip = ({ item }: { item: (typeof STATUS_FILTERS)[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        statusFilter === item.value && styles.filterChipActive,
      ]}
      onPress={() => setStatusFilter(item.value)}
    >
      <Text
        style={[
          styles.filterChipText,
          statusFilter === item.value && styles.filterChipTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ShoppingBag
        size={64}
        color={theme.colors.text.tertiary}
        strokeWidth={1}
      />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your AgriMall orders will appear here
      </Text>
      <AnimatedButton
        title="Browse Products"
        variant="primary"
        size="md"
        style={{ marginTop: theme.spacing.lg }}
        onPress={() => router.push("/agrimall" as any)}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary[600]} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading orders...</Text>
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
        <Text style={styles.title}>My AgriMall Orders</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Filter size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={STATUS_FILTERS}
            keyExtractor={(item) => item.value}
            renderItem={renderFilterChip}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
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
  filterButton: {
    padding: theme.spacing.xs,
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
  filtersContainer: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  filtersList: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[600],
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  orderCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  orderNumberContainer: {},
  orderNumber: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  orderDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: "capitalize",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  productQuantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: theme.spacing.md,
  },
  viewDetails: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
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
  loadMoreContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
});

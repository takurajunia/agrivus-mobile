import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
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
        return neumorphicColors.text.tertiary;
      case "paid":
        return neumorphicColors.semantic.info;
      case "processing":
        return neumorphicColors.semantic.warning;
      case "ready_for_pickup":
        return neumorphicColors.secondary[600];
      case "shipped":
      case "in_transit":
        return neumorphicColors.primary[600];
      case "delivered":
      case "confirmed":
        return neumorphicColors.semantic.success;
      case "cancelled":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
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
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderOrderItem = ({ item }: { item: AgrimallOrder }) => (
    <NeumorphicCard
      style={styles.orderCard}
      onPress={() => handleOrderPress(item.id)}
      variant="standard"
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
        <Package size={20} color={neumorphicColors.primary[600]} />
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
        <ChevronRight size={18} color={neumorphicColors.primary[600]} />
      </View>
    </NeumorphicCard>
  );

  const renderFilterChip = ({ item }: { item: (typeof STATUS_FILTERS)[0] }) => (
    <NeumorphicButton
      title={item.label}
      variant={statusFilter === item.value ? "primary" : "secondary"}
      size="small"
      onPress={() => setStatusFilter(item.value)}
      style={styles.filterChip}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ShoppingBag
        size={64}
        color={neumorphicColors.text.tertiary}
        strokeWidth={1}
      />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your AgriMall orders will appear here
      </Text>
      <NeumorphicButton
        title="Browse Products"
        variant="primary"
        size="medium"
        style={{ marginTop: spacing.lg }}
        onPress={() => router.push("/agrimall" as any)}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={neumorphicColors.primary[600]} />
      </View>
    );
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading orders...</Text>
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
          variant="ghost"
          size="medium"
        />
        <Text style={styles.title}>My AgriMall Orders</Text>
        <NeumorphicIconButton
          icon={<Filter size={24} color={neumorphicColors.text.primary} />}
          onPress={() => setShowFilters(!showFilters)}
          variant="ghost"
          size="medium"
        />
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
            colors={[neumorphicColors.primary[600]]}
            tintColor={neumorphicColors.primary[600]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
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
  filtersContainer: {
    backgroundColor: neumorphicColors.base.background,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.shadowDark + "20",
  },
  filtersList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  orderCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  orderNumberContainer: {},
  orderNumber: {
    ...typography.h6,
    color: neumorphicColors.text.primary,
  },
  orderDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark + "20",
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.shadowDark + "20",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  productQuantity: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  orderTotal: {
    ...typography.h5,
    fontWeight: "700",
    color: neumorphicColors.primary[600],
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.md,
  },
  viewDetails: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.primary[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
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
  loadMoreContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});

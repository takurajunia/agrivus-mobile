import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  ChevronRight,
  Calendar,
  DollarSign,
  User,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicSearchBar,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import adminService from "../../src/services/adminService";

type AdminOrderStatus =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

// Extended order type for admin view with joined data
interface AdminOrder {
  id: string;
  orderNumber?: string;
  buyerId: string;
  farmerId: string;
  listingId: string;
  buyerName?: string;
  sellerName?: string;
  productName?: string;
  quantity: string | number;
  unit?: string;
  totalAmount: string | number;
  status: string;
  createdAt: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  notes?: string;
}

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<AdminOrderStatus>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs: { key: AdminOrderStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const fetchOrders = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setPage(1);
        }

        const params: any = {
          page: refresh ? 1 : page,
          limit: 20,
        };

        if (activeTab !== "all") {
          params.status = activeTab;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await adminService.getAllOrders(params);

        if (response.success) {
          const newOrders = (response.data.orders || []) as AdminOrder[];
          if (refresh || page === 1) {
            setOrders(newOrders);
          } else {
            setOrders((prev) => [...prev, ...newOrders]);
          }
          setHasMore(newOrders.length === 20);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        Alert.alert("Error", "Failed to load orders");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, activeTab, searchQuery]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchOrders(true);
  }, [activeTab, searchQuery]);

  const handleRefresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock size={16} color={neumorphicColors.semantic.warning} />;
      case "processing":
        return <Package size={16} color={neumorphicColors.semantic.info} />;
      case "shipped":
        return <Truck size={16} color={neumorphicColors.primary[600]} />;
      case "delivered":
        return (
          <CheckCircle size={16} color={neumorphicColors.semantic.success} />
        );
      case "cancelled":
        return <XCircle size={16} color={neumorphicColors.semantic.error} />;
      default:
        return <Package size={16} color={neumorphicColors.text.tertiary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return neumorphicColors.semantic.warning;
      case "processing":
        return neumorphicColors.semantic.info;
      case "shipped":
        return neumorphicColors.primary[600];
      case "delivered":
        return neumorphicColors.semantic.success;
      case "cancelled":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₦${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderOrder = (order: AdminOrder, index: number) => (
    <NeumorphicCard
      key={order.id}
      style={styles.orderCard}
      animationDelay={index * 50}
      onPress={() => router.push(`/order/${order.id}` as any)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderNumber}>
          <Text style={styles.orderNumberText}>
            #{order.orderNumber || order.id.slice(-8)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(order.status)}15` },
            ]}
          >
            {getStatusIcon(order.status)}
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(order.status) },
              ]}
            >
              {order.status}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={neumorphicColors.text.tertiary} />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Package size={14} color={neumorphicColors.text.tertiary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {order.productName || "Product"} ({order.quantity}{" "}
            {order.unit || "units"})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <User size={14} color={neumorphicColors.text.tertiary} />
          <Text style={styles.detailText}>
            {order.buyerName || "Buyer"} → {order.sellerName || "Seller"}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.detailText}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.amountContainer}>
            <DollarSign size={14} color={neumorphicColors.semantic.success} />
            <Text style={styles.amountText}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>
      </View>
    </NeumorphicCard>
  );

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
        <Text style={styles.title}>All Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading orders...</Text>
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
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Package
                size={64}
                color={neumorphicColors.text.tertiary}
                strokeWidth={1}
              />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : `No ${activeTab !== "all" ? activeTab : ""} orders yet`}
              </Text>
            </View>
          ) : (
            <>
              {orders.map((order, index) => renderOrder(order, index))}

              {hasMore && (
                <NeumorphicButton
                  title="Load More"
                  variant="secondary"
                  size="medium"
                  style={styles.loadMoreButton}
                  onPress={() => {
                    setPage((prev) => prev + 1);
                    fetchOrders();
                  }}
                />
              )}
            </>
          )}
        </ScrollView>
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
    backgroundColor: neumorphicColors.base.background,
  },
  backButton: {
    padding: spacing.xs,
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
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.input,
    marginRight: spacing.sm,
  },
  activeTab: {
    backgroundColor: neumorphicColors.primary[600],
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
  },
  activeTabText: {
    color: neumorphicColors.text.inverse,
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
  orderCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  orderNumber: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  orderNumberText: {
    ...typography.h5,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  orderDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  amountText: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.semantic.success,
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
  loadMoreButton: {
    marginTop: spacing.md,
  },
});

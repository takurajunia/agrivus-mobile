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
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import ModernInput from "../../src/components/ModernInput";
import { theme } from "../../src/theme/tokens";
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
        return <Clock size={16} color={theme.colors.warning} />;
      case "processing":
        return <Package size={16} color={theme.colors.info} />;
      case "shipped":
        return <Truck size={16} color={theme.colors.primary[600]} />;
      case "delivered":
        return <CheckCircle size={16} color={theme.colors.success} />;
      case "cancelled":
        return <XCircle size={16} color={theme.colors.error} />;
      default:
        return <Package size={16} color={theme.colors.text.tertiary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return theme.colors.warning;
      case "processing":
        return theme.colors.info;
      case "shipped":
        return theme.colors.primary[600];
      case "delivered":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
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
    <AnimatedCard
      key={order.id}
      style={styles.orderCard}
      delay={index * 50}
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
        <ChevronRight size={20} color={theme.colors.text.tertiary} />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Package size={14} color={theme.colors.text.tertiary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {order.productName || "Product"} ({order.quantity}{" "}
            {order.unit || "units"})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <User size={14} color={theme.colors.text.tertiary} />
          <Text style={styles.detailText}>
            {order.buyerName || "Buyer"} → {order.sellerName || "Seller"}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.detailText}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.amountContainer}>
            <DollarSign size={14} color={theme.colors.success} />
            <Text style={styles.amountText}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>
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
        <Text style={styles.title}>All Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
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
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
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
              colors={[theme.colors.primary[600]]}
              tintColor={theme.colors.primary[600]}
            />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Package
                size={64}
                color={theme.colors.text.tertiary}
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
                <AnimatedButton
                  title="Load More"
                  variant="outline"
                  size="md"
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
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
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
  orderCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  orderNumber: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  orderNumberText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  orderDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  amountText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
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
  loadMoreButton: {
    marginTop: theme.spacing.md,
  },
});

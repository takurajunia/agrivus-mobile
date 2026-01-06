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
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
  Truck,
  DollarSign,
  AlertCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicBadge,
} from "../../src/components/neumorphic";
import ordersService, {
  OrderWithDetails,
} from "../../src/services/ordersService";
import { useAuth } from "../../src/contexts/AuthContext";
import type { OrderStatus } from "../../src/types";

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchOrders = useCallback(
    async (status?: string) => {
      try {
        const response = await ordersService.getOrders({
          status:
            status === "all" || !status ? undefined : (status as OrderStatus),
          page: pagination.page,
          limit: pagination.limit,
        });

        if (response.success && response.data) {
          setOrders(response.data.orders);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        Alert.alert("Error", "Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.page, pagination.limit]
  );

  useEffect(() => {
    fetchOrders(activeTab === "all" ? undefined : (activeTab as OrderStatus));
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(activeTab === "all" ? undefined : (activeTab as OrderStatus));
  }, [activeTab, fetchOrders]);

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(
        (o) => o.status === "pending" || o.status === "payment_pending"
      ).length,
      paid: orders.filter((o) => o.status === "paid" || o.status === "assigned")
        .length,
      in_transit: orders.filter((o) => o.status === "in_transit").length,
      delivered: orders.filter(
        (o) => o.status === "delivered" || o.status === "confirmed"
      ).length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const tabs = [
    { key: "all", label: "All", count: pagination.total },
    { key: "pending", label: "Pending", count: statusCounts.pending },
    { key: "paid", label: "Paid", count: statusCounts.paid },
    { key: "in_transit", label: "In Transit", count: statusCounts.in_transit },
    { key: "delivered", label: "Delivered", count: statusCounts.delivered },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return neumorphicColors.semantic.success;
      case "in_transit":
      case "assigned":
        return neumorphicColors.semantic.info;
      case "paid":
        return neumorphicColors.primary[600];
      case "pending":
      case "payment_pending":
        return neumorphicColors.secondary[500];
      case "cancelled":
      case "disputed":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return CheckCircle;
      case "in_transit":
        return Truck;
      case "assigned":
      case "paid":
        return DollarSign;
      case "pending":
      case "payment_pending":
        return Clock;
      case "cancelled":
        return XCircle;
      case "disputed":
        return AlertCircle;
      default:
        return Package;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} min ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="list">
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
    <NeumorphicScreen variant="list" showLeaves={true}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <NeumorphicButton
          title="Filter"
          variant="tertiary"
          size="small"
          icon={<Filter size={16} color={neumorphicColors.primary[600]} />}
          onPress={() => console.log("Filter pressed")}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        <View style={styles.tabs}>
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
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
        <View style={styles.ordersContainer}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={64} color={neumorphicColors.text.tertiary} />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptyText}>
                {user?.role === "buyer"
                  ? "Start shopping to see your orders here"
                  : "Orders from buyers will appear here"}
              </Text>
            </View>
          ) : (
            orders.map((order, index) => {
              const StatusIcon = getStatusIcon(order.status);
              const otherParty =
                user?.role === "buyer" ? order.farmer : order.buyer;
              const productName =
                order.listing?.cropName || order.listing?.cropType || "Product";

              return (
                <NeumorphicCard
                  key={order.id}
                  style={styles.orderCard}
                  animationDelay={index * 100}
                  onPress={() => handleOrderPress(order.id)}
                  variant="standard"
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text style={styles.customerName}>
                        {otherParty?.fullName || "Unknown"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${getStatusColor(order.status)}20`,
                        },
                      ]}
                    >
                      <StatusIcon
                        size={14}
                        color={getStatusColor(order.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {formatStatus(order.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Product:</Text>
                      <Text style={styles.detailValue}>{productName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quantity:</Text>
                      <Text style={styles.detailValue}>
                        {order.quantity} {order.listing?.unit || "kg"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={styles.detailValue}>
                        {formatAmount(order.totalAmount)}
                      </Text>
                    </View>
                    {order.transportAssignment && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transport:</Text>
                        <Text style={styles.detailValue}>
                          {order.transportAssignment.transporter?.fullName ||
                            "Assigned"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </Text>
                    <ChevronRight
                      size={16}
                      color={neumorphicColors.text.tertiary}
                    />
                  </View>
                </NeumorphicCard>
              );
            })
          )}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  tabsContainer: {
    maxHeight: 56,
    marginBottom: spacing.lg,
  },
  tabs: {
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    gap: spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: neumorphicColors.base.card,
    // Neumorphic shadow
    shadowColor: neumorphicColors.base.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: neumorphicColors.primary[600],
  },
  tabText: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
  },
  activeTabText: {
    color: neumorphicColors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
    paddingHorizontal: spacing.xl,
  },
  orderCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    ...typography.caption,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  customerName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "500",
  },
  orderDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    fontWeight: "500",
  },
  detailValue: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

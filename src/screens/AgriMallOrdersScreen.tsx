import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package,
  Clock,
  ChevronRight,
  Check,
  Truck,
  XCircle,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";
import { agrimallService } from "../services/agrimallService";
import type { AgrimallOrder } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import OptimizedImage from "../components/OptimizedImage";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicBadge from "../components/neumorphic/NeumorphicBadge";

export default function AgriMallOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<AgrimallOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await agrimallService.getOrders();
      setOrders(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "processing":
        return Package;
      case "shipped":
        return Truck;
      case "delivered":
        return Check;
      case "cancelled":
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "warning" | "info" | "primary" | "success" | "error" | "neutral" => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "neutral";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
        return neumorphicColors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
  ];

  if (loading && !refreshing) {
    return (
      <NeumorphicScreen variant="list">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AgriMall Orders</Text>
        <Text style={styles.subtitle}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((f) => (
          <NeumorphicButton
            key={f.value}
            title={f.label}
            variant={filter === f.value ? "primary" : "secondary"}
            size="small"
            onPress={() => setFilter(f.value)}
            style={styles.filterChip}
          />
        ))}
      </ScrollView>

      {/* Error */}
      {error ? (
        <NeumorphicCard style={styles.errorContainer} variant="bordered">
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            variant="danger"
            size="small"
            onPress={fetchOrders}
            style={styles.retryButton}
          />
        </NeumorphicCard>
      ) : null}

      {/* Orders List */}
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
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color={neumorphicColors.text.tertiary} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Start shopping to see your orders here"
                : `No ${filter} orders found`}
            </Text>
            <NeumorphicButton
              title="Shop Now"
              variant="primary"
              onPress={() => router.push("/agrimall")}
              style={styles.shopButton}
            />
          </View>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const statusColor = getStatusColor(order.status);

            return (
              <NeumorphicCard
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/agrimall-orders/${order.id}`)}
                variant="elevated"
              >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderId}>#{order.id.slice(-8)}</Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <NeumorphicBadge
                    label={
                      order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)
                    }
                    variant={getStatusBadgeVariant(order.status)}
                    size="small"
                    icon={<StatusIcon size={12} color={statusColor} />}
                  />
                </View>

                {/* Order Items Preview */}
                <View style={styles.itemsPreview}>
                  {order.items?.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.itemPreview}>
                      <View style={styles.itemImageContainer}>
                        {item.product?.imageUrl ? (
                          <OptimizedImage
                            uri={item.product.imageUrl}
                            style={styles.itemImage}
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Text>🌾</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <View style={styles.moreItems}>
                      <Text style={styles.moreItemsText}>
                        +{order.items.length - 3}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      ${parseFloat(order.totalAmount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                  <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <ChevronRight
                      size={16}
                      color={neumorphicColors.primary[600]}
                    />
                  </View>
                </View>
              </NeumorphicCard>
            );
          })
        )}

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
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: neumorphicColors.base.card,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  filterScroll: {
    backgroundColor: neumorphicColors.base.card,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.background,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  errorText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  shopButton: {
    marginTop: spacing.xl,
  },
  orderCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.background,
  },
  orderIdContainer: {},
  orderId: {
    ...typography.h6,
  },
  orderDate: {
    ...typography.caption,
    marginTop: 2,
  },
  itemsPreview: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemPreview: {},
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    backgroundColor: neumorphicColors.base.background,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: neumorphicColors.primary[100],
  },
  moreItems: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: neumorphicColors.base.background,
    justifyContent: "center",
    alignItems: "center",
  },
  moreItemsText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.background,
    backgroundColor: neumorphicColors.base.input,
  },
  totalLabel: {
    ...typography.caption,
  },
  totalValue: {
    ...typography.h5,
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailsText: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.primary[600],
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

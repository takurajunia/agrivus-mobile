import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { NeumorphicScreen } from "../components/neumorphic/NeumorphicScreen";
import { NeumorphicCard } from "../components/neumorphic/NeumorphicCard";
import { NeumorphicButton } from "../components/neumorphic/NeumorphicButton";
import { NeumorphicBadge } from "../components/neumorphic/NeumorphicBadge";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  itemCount: number;
  sellerName: string;
}

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-001",
    date: "2026-01-05",
    status: "delivered",
    total: 15000,
    itemCount: 3,
    sellerName: "Green Farms Ltd",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-002",
    date: "2026-01-04",
    status: "shipped",
    total: 8500,
    itemCount: 2,
    sellerName: "Organic Valley",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-003",
    date: "2026-01-03",
    status: "processing",
    total: 22000,
    itemCount: 5,
    sellerName: "AgriCoop",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-004",
    date: "2026-01-02",
    status: "pending",
    total: 5000,
    itemCount: 1,
    sellerName: "Farm Fresh",
  },
];

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return neumorphicColors.semantic.success;
    case "shipped":
      return neumorphicColors.semantic.info;
    case "processing":
      return neumorphicColors.semantic.warning;
    case "pending":
      return neumorphicColors.secondary.main;
    case "cancelled":
      return neumorphicColors.semantic.error;
    default:
      return neumorphicColors.text.secondary;
  }
};

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "checkmark-circle";
    case "shipped":
      return "car";
    case "processing":
      return "time";
    case "pending":
      return "hourglass";
    case "cancelled":
      return "close-circle";
    default:
      return "help-circle";
  }
};

const OrdersScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [orders] = useState<Order[]>(mockOrders);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <NeumorphicCard style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        </View>
        <NeumorphicBadge
          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={
            item.status === "delivered"
              ? "success"
              : item.status === "cancelled"
              ? "error"
              : item.status === "shipped"
              ? "info"
              : "warning"
          }
          size="small"
        />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="storefront-outline"
            size={16}
            color={neumorphicColors.text.secondary}
          />
          <Text style={styles.sellerName}>{item.sellerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="cube-outline"
            size={16}
            color={neumorphicColors.text.secondary}
          />
          <Text style={styles.itemCount}>
            {item.itemCount} {item.itemCount === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
      </View>

      <View style={styles.actionButtons}>
        <NeumorphicButton
          label="View Details"
          onPress={() => {}}
          variant="secondary"
          size="small"
          style={styles.actionButton}
        />
        {item.status === "delivered" && (
          <NeumorphicButton
            label="Reorder"
            onPress={() => {}}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        )}
      </View>
    </NeumorphicCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="receipt-outline"
        size={64}
        color={neumorphicColors.text.tertiary}
      />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your order history will appear here once you make a purchase.
      </Text>
      <NeumorphicButton
        label="Start Shopping"
        onPress={() => {}}
        variant="primary"
        style={styles.shopButton}
      />
    </View>
  );

  return (
    <NeumorphicScreen variant="list">
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={neumorphicColors.primary.main}
            colors={[neumorphicColors.primary.main]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </NeumorphicScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
  orderCard: {
    padding: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  orderDate: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  orderDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sellerName: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.sm,
  },
  itemCount: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.sm,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.border,
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  totalAmount: {
    ...typography.h4,
    color: neumorphicColors.primary.main,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  shopButton: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
});

export default OrdersScreen;

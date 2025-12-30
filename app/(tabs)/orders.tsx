import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState("all");

  const orders = [
    {
      id: "ORD-1001",
      customer: "John Farms Co.",
      product: "Organic Tomatoes",
      quantity: "500 kg",
      amount: "$1,250",
      status: "delivered",
      date: "2 days ago",
    },
    {
      id: "ORD-1002",
      customer: "Green Valley Market",
      product: "Fresh Carrots",
      quantity: "300 kg",
      amount: "$780",
      status: "processing",
      date: "5 hours ago",
    },
    {
      id: "ORD-1003",
      customer: "Urban Grocery",
      product: "Potatoes",
      quantity: "1000 kg",
      amount: "$2,100",
      status: "pending",
      date: "1 day ago",
    },
    {
      id: "ORD-1004",
      customer: "Fresh Foods Inc.",
      product: "Bell Peppers",
      quantity: "200 kg",
      amount: "$950",
      status: "cancelled",
      date: "3 days ago",
    },
    {
      id: "ORD-1005",
      customer: "Local Market",
      product: "Organic Lettuce",
      quantity: "150 kg",
      amount: "$420",
      status: "delivered",
      date: "1 week ago",
    },
  ];

  const tabs = [
    { key: "all", label: "All", count: orders.length },
    { key: "pending", label: "Pending", count: 1 },
    { key: "processing", label: "Processing", count: 1 },
    { key: "delivered", label: "Delivered", count: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return theme.colors.success;
      case "processing":
        return theme.colors.info;
      case "pending":
        return theme.colors.secondary[500];
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return CheckCircle;
      case "processing":
        return Clock;
      case "pending":
        return Clock;
      case "cancelled":
        return XCircle;
      default:
        return Package;
    }
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <AnimatedButton
          title="Filter"
          variant="outline"
          size="sm"
          onPress={() => console.log("Filter pressed")}
        >
          <Filter size={16} color={theme.colors.primary[600]} />
        </AnimatedButton>
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
      >
        <View style={styles.ordersContainer}>
          {filteredOrders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <AnimatedCard
                key={order.id}
                style={styles.orderCard}
                delay={index * 100}
                onPress={() => console.log(`Order ${order.id} pressed`)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.customerName}>{order.customer}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(order.status)}20` },
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
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Product:</Text>
                    <Text style={styles.detailValue}>{order.product}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{order.quantity}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{order.amount}</Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>{order.date}</Text>
                  <ChevronRight size={16} color={theme.colors.text.tertiary} />
                </View>
              </AnimatedCard>
            );
          })}
        </View>
        <View style={styles.bottomPadding} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  tabsContainer: {
    maxHeight: 56,
    marginBottom: theme.spacing.lg,
  },
  tabs: {
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.primary,
    ...theme.shadows.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
  orderCard: {
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  customerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  orderDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  Bell,
  Package,
  DollarSign,
  Gavel,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      message: "John Farms Co. placed an order for 500kg Organic Tomatoes",
      time: "5 minutes ago",
      unread: true,
      icon: ShoppingCart,
      color: theme.colors.success,
    },
    {
      id: 2,
      type: "bid",
      title: "Auction Bid Placed",
      message: "Someone bid $850 on your Fresh Carrots auction",
      time: "1 hour ago",
      unread: true,
      icon: Gavel,
      color: theme.colors.warning,
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Received",
      message: "Payment of $1,250 has been credited to your account",
      time: "2 hours ago",
      unread: true,
      icon: DollarSign,
      color: theme.colors.info,
    },
    {
      id: 4,
      type: "stock",
      title: "Low Stock Alert",
      message: "3 products are running low on stock. Restock soon!",
      time: "3 hours ago",
      unread: false,
      icon: AlertCircle,
      color: theme.colors.error,
    },
    {
      id: 5,
      type: "listing",
      title: "Product Listed Successfully",
      message: "Your Bell Peppers listing is now live on marketplace",
      time: "1 day ago",
      unread: false,
      icon: Package,
      color: theme.colors.secondary[600],
    },
    {
      id: 6,
      type: "trend",
      title: "Price Trend Alert",
      message: "Tomato prices increased by 15% in your region",
      time: "1 day ago",
      unread: false,
      icon: TrendingUp,
      color: theme.colors.success,
    },
    {
      id: 7,
      type: "order",
      title: "Order Delivered",
      message: "Order #ORD-1001 has been successfully delivered",
      time: "2 days ago",
      unread: false,
      icon: Package,
      color: theme.colors.success,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        <AnimatedButton
          title="Mark all read"
          variant="outline"
          size="sm"
          onPress={() => console.log("Mark all read pressed")}
        />
      </View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification, index) => (
          <AnimatedCard
            key={notification.id}
            style={[
              styles.notificationCard,
              notification.unread && styles.unreadCard,
            ]}
            delay={index * 50}
            onPress={() =>
              console.log(`Notification ${notification.id} pressed`)
            }
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${notification.color}20` },
              ]}
            >
              <notification.icon
                size={24}
                color={notification.color}
                strokeWidth={2}
              />
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                {notification.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </AnimatedCard>
        ))}
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
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  notificationCard: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  notificationTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  notificationTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  TrendingUp,
  Package,
  DollarSign,
  Gavel,
  ShoppingCart,
  BarChart3,
  AlertCircle,
  ChevronRight,
  Store,
  Globe,
  ArrowRight,
  ClipboardList,
  Search,
  Heart,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react-native";

// Services
import ordersService from "../../src/services/ordersService";
import { auctionsService } from "../../src/services/auctionsService";
import notificationsService from "../../src/services/notificationsService";
import { listingsService } from "../../src/services/listingsService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const QUICK_ACTION_CARD_SIZE = (SCREEN_WIDTH - 64) / 4; // 4 columns with padding

// Components
import TopNavBar from "../../src/components/TopNavBar";

// Neumorphic Components
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicStatCard,
} from "../../src/components/neumorphic";

import {
  neumorphicColors,
  typography,
  spacing,
} from "../../src/theme/neumorphic";

// Quick Action Card Component with proper proportions and animations
interface QuickActionCardProps {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  onPress: () => void;
  index: number;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  label,
  icon: Icon,
  color,
  bgColor,
  onPress,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 500 + index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 500 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.quickActionWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.quickActionTouchable}
      >
        <View
          style={[
            styles.quickActionIconContainer,
            { backgroundColor: bgColor },
          ]}
        >
          <Icon size={24} color={color} strokeWidth={2} />
        </View>
        <Text style={styles.quickActionLabel} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real data state
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalRevenue: 0,
    activeBids: 0,
    activeListings: 0,
    liveAuctions: 0,
    pendingOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const isBuyer = user?.role === "buyer";
  const isFarmer = user?.role === "farmer";

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch orders
      const ordersResponse = await ordersService.getOrders({
        page: 1,
        limit: 100,
      });
      const orders = ordersResponse.data?.orders || [];

      // Calculate stats from orders
      const totalOrders =
        ordersResponse.data?.pagination?.total || orders.length;
      const totalSpent = orders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount || "0");
      }, 0);
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "payment_pending"
      ).length;

      // Fetch bids for buyers
      let activeBids = 0;
      if (isBuyer) {
        try {
          const bidsResponse = await auctionsService.getMyBids();
          const bids = bidsResponse.data?.bids || bidsResponse.data || [];
          activeBids = Array.isArray(bids)
            ? bids.filter(
                (b: any) =>
                  b.auction?.status === "active" || b.auction?.status === "live"
              ).length
            : 0;
        } catch (e) {
          console.log("Failed to fetch bids:", e);
        }
      }

      // Fetch listings for farmers
      let activeListings = 0;
      let liveAuctions = 0;
      if (isFarmer) {
        try {
          const listingsResponse = await listingsService.getMyListings();
          const listings = listingsResponse.data || [];
          activeListings = Array.isArray(listings)
            ? listings.filter((l: any) => l.status === "active").length
            : 0;
          liveAuctions = Array.isArray(listings)
            ? listings.filter((l: any) => l.isAuction && l.status === "active")
                .length
            : 0;
        } catch (e) {
          console.log("Failed to fetch listings:", e);
        }
      }

      // Calculate revenue for farmers (from completed orders)
      const totalRevenue = isFarmer
        ? orders.reduce((sum, order) => {
            if (order.status === "delivered" || order.status === "confirmed") {
              return sum + parseFloat(order.totalAmount || "0");
            }
            return sum;
          }, 0)
        : 0;

      setDashboardData({
        totalOrders,
        totalSpent,
        totalRevenue,
        activeBids,
        activeListings,
        liveAuctions,
        pendingOrders,
      });

      // Fetch recent notifications for activity
      try {
        const notificationsResponse =
          await notificationsService.getNotifications(false, 5, 0);
        const notifications = notificationsResponse.data?.notifications || [];

        const formattedActivity = notifications.map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          subtitle: notif.message,
          time: formatTimeAgo(notif.createdAt),
          type: mapNotificationType(notif.type),
          notificationType: notif.type,
          data: notif.data,
        }));

        setRecentActivity(formattedActivity);
      } catch (e) {
        console.log("Failed to fetch notifications:", e);
        // Fallback to orders as activity
        const orderActivity = orders.slice(0, 4).map((order: any) => ({
          id: order.id,
          title: getOrderActivityTitle(order.status),
          subtitle: `Order #${order.id.slice(0, 8)} - $${parseFloat(
            order.totalAmount || "0"
          ).toFixed(2)}`,
          time: formatTimeAgo(order.createdAt),
          type: getOrderActivityType(order.status),
          notificationType: "order",
          data: { orderId: order.id },
        }));
        setRecentActivity(orderActivity);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [isBuyer, isFarmer]);

  // Helper functions
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const mapNotificationType = (type: string) => {
    const typeMap: Record<string, string> = {
      order_created: "order",
      order_status: "order",
      order_delivered: "delivery",
      bid_placed: "auction",
      bid_outbid: "auction",
      auction_won: "auction",
      payment_received: "payment",
      payment_sent: "payment",
      listing_created: "listing",
    };
    return typeMap[type] || "order";
  };

  const getOrderActivityTitle = (status: string) => {
    const titles: Record<string, string> = {
      pending: "Order placed",
      payment_pending: "Awaiting payment",
      paid: "Payment confirmed",
      assigned: "Transport assigned",
      in_transit: "Order in transit",
      delivered: "Order delivered",
      confirmed: "Delivery confirmed",
      cancelled: "Order cancelled",
    };
    return titles[status] || "Order updated";
  };

  const getOrderActivityType = (status: string) => {
    const types: Record<string, string> = {
      pending: "order",
      payment_pending: "payment",
      paid: "payment",
      assigned: "shipping",
      in_transit: "shipping",
      delivered: "delivery",
      confirmed: "delivery",
      cancelled: "order",
    };
    return types[status] || "order";
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Farmer Stats - using real data
  const farmerStats = [
    {
      title: "Active Orders",
      value: String(dashboardData.pendingOrders),
      icon: (
        <ShoppingCart
          size={24}
          color={neumorphicColors.primary[600]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.primary[600],
      trend: { value: 0, direction: "neutral" as const },
    },
    {
      title: "Revenue",
      value: `$${dashboardData.totalRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: (
        <DollarSign
          size={24}
          color={neumorphicColors.semantic.success}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.semantic.success,
      trend: { value: 0, direction: "neutral" as const },
    },
    {
      title: "Live Auctions",
      value: String(dashboardData.liveAuctions),
      icon: (
        <Gavel
          size={24}
          color={neumorphicColors.secondary[600]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.secondary[600],
      trend: { value: 0, direction: "neutral" as const },
    },
    {
      title: "Products",
      value: String(dashboardData.activeListings),
      icon: (
        <Package
          size={24}
          color={neumorphicColors.primary[700]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.primary[700],
      trend: { value: 0, direction: "neutral" as const },
    },
  ];

  // Buyer Stats - using real data
  const buyerStats = [
    {
      title: "Total Orders",
      value: String(dashboardData.totalOrders),
      icon: (
        <ShoppingCart
          size={24}
          color={neumorphicColors.primary[600]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.primary[600],
      trend: { value: 0, direction: "neutral" as const },
    },
    {
      title: "Total Spent",
      value: `$${dashboardData.totalSpent.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: (
        <DollarSign
          size={24}
          color={neumorphicColors.semantic.success}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.semantic.success,
      trend: { value: 0, direction: "neutral" as const },
    },
    {
      title: "Active Bids",
      value: String(dashboardData.activeBids),
      icon: (
        <Gavel
          size={24}
          color={neumorphicColors.secondary[600]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.secondary[600],
      trend: { value: 0, direction: "neutral" as const },
    },
    {
      title: "Pending",
      value: String(dashboardData.pendingOrders),
      icon: (
        <Clock
          size={24}
          color={neumorphicColors.semantic.warning}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.semantic.warning,
      trend: { value: 0, direction: "neutral" as const },
    },
  ];

  const stats = isBuyer ? buyerStats : farmerStats;

  // Farmer Quick Actions
  const farmerQuickActions = [
    {
      label: "New Listing",
      icon: Package,
      color: neumorphicColors.primary[600],
      bgColor: neumorphicColors.primary[50],
      route: "/create-listing",
    },
    {
      label: "My Listings",
      icon: ClipboardList,
      color: neumorphicColors.secondary[600],
      bgColor: neumorphicColors.secondary[50],
      route: "/my-listings",
    },
    {
      label: "AgriMall",
      icon: Store,
      color: neumorphicColors.primary[500],
      bgColor: neumorphicColors.primary[50],
      route: "/agrimall",
    },
    {
      label: "Export",
      icon: Globe,
      color: neumorphicColors.semantic.info,
      bgColor: "#E3F2FD",
      route: "/export-gateway",
    },
  ];

  // Buyer Quick Actions
  const buyerQuickActions = [
    {
      label: "Marketplace",
      icon: Store,
      color: neumorphicColors.primary[600],
      bgColor: neumorphicColors.primary[50],
      route: "/(tabs)/marketplace",
    },
    {
      label: "My Orders",
      icon: ShoppingCart,
      color: neumorphicColors.secondary[600],
      bgColor: neumorphicColors.secondary[50],
      route: "/(tabs)/orders",
    },
    {
      label: "My Bids",
      icon: Gavel,
      color: neumorphicColors.semantic.warning,
      bgColor: "#FFF3E0",
      route: "/my-bids",
    },
    {
      label: "Cart",
      icon: Store,
      color: neumorphicColors.semantic.info,
      bgColor: "#E3F2FD",
      route: "/cart",
    },
  ];

  const quickActions = isBuyer ? buyerQuickActions : farmerQuickActions;

  // Recent activity is now fetched from API (recentActivity state)

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart size={16} color={neumorphicColors.primary[600]} />;
      case "auction":
        return <Gavel size={16} color={neumorphicColors.secondary[600]} />;
      case "payment":
        return (
          <DollarSign size={16} color={neumorphicColors.semantic.success} />
        );
      case "listing":
        return <Package size={16} color={neumorphicColors.primary[500]} />;
      case "delivery":
        return (
          <CheckCircle size={16} color={neumorphicColors.semantic.success} />
        );
      case "shipping":
        return <Truck size={16} color={neumorphicColors.semantic.info} />;
      default:
        return <AlertCircle size={16} color={neumorphicColors.text.tertiary} />;
    }
  };

  const handleActivityPress = (activity: any) => {
    const activityData = activity.data;
    const notificationType = activity.notificationType;

    switch (notificationType) {
      case "order":
      case "order_placed":
      case "order_received":
      case "order_update":
      case "order_delivered":
        if (activityData?.orderId) {
          router.push(`/order/${activityData.orderId}`);
        } else {
          router.push("/(tabs)/orders");
        }
        break;
      case "bid":
      case "auction":
      case "auction_won":
      case "auction_outbid":
        if (activityData?.auctionId) {
          router.push(`/auction/${activityData.auctionId}`);
        } else {
          router.push("/(tabs)/auctions");
        }
        break;
      case "message":
      case "chat":
        if (activityData?.conversationId) {
          router.push(`/chat/${activityData.conversationId}`);
        } else {
          router.push("/(tabs)/chat");
        }
        break;
      case "payment":
      case "payment_received":
      case "wallet":
        router.push("/(tabs)/wallet");
        break;
      case "listing":
        if (activityData?.listingId) {
          router.push(`/listing/${activityData.listingId}`);
        } else {
          router.push("/(tabs)/marketplace");
        }
        break;
      default:
        // For other types, go to orders by default
        router.push("/(tabs)/orders");
        break;
    }
  };

  // Alert banner content based on role and real data
  const alertContent = isBuyer
    ? dashboardData.pendingOrders > 0
      ? {
          text: `You have ${dashboardData.pendingOrders} pending order${
            dashboardData.pendingOrders > 1 ? "s" : ""
          }`,
          icon: Clock,
        }
      : { text: "Browse the marketplace for fresh produce!", icon: Store }
    : dashboardData.pendingOrders > 0
    ? {
        text: `${dashboardData.pendingOrders} order${
          dashboardData.pendingOrders > 1 ? "s" : ""
        } need${dashboardData.pendingOrders === 1 ? "s" : ""} attention`,
        icon: AlertCircle,
      }
    : { text: "List your products to start selling!", icon: Package };

  return (
    <NeumorphicScreen variant="dashboard" showLeaves={true}>
      {/* Top Navigation Bar */}
      <TopNavBar showGreeting={true} unreadChats={2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
            tintColor={neumorphicColors.primary[600]}
          />
        }
      >
        {/* Alert Banner - Role specific */}
        <NeumorphicCard
          variant="glass"
          style={styles.alertBanner}
          animated={true}
          animationDelay={100}
          onPress={() => router.push(isBuyer ? "/cart" : "/my-listings")}
        >
          <View style={styles.alertContent}>
            <View style={styles.alertIconContainer}>
              <alertContent.icon
                size={20}
                color={neumorphicColors.secondary[600]}
              />
            </View>
            <Text style={styles.alertText}>{alertContent.text}</Text>
            <ChevronRight size={18} color={neumorphicColors.text.tertiary} />
          </View>
        </NeumorphicCard>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <NeumorphicStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              trend={stat.trend}
              style={styles.statCard}
              animationDelay={200 + index * 100}
            />
          ))}
        </View>

        {/* Quick Actions - Redesigned */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                label={action.label}
                icon={action.icon}
                color={action.color}
                bgColor={action.bgColor}
                onPress={() => router.push(action.route as any)}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/orders")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <NeumorphicCard
                key={activity.id}
                variant="bordered"
                style={styles.activityItem}
                animationDelay={1000 + index * 100}
                onPress={() => handleActivityPress(activity)}
              >
                <View style={styles.activityRow}>
                  <View style={styles.activityIconContainer}>
                    {getActivityIcon(activity.type)}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>
                      {activity.subtitle}
                    </Text>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <ChevronRight
                      size={16}
                      color={neumorphicColors.text.tertiary}
                    />
                  </View>
                </View>
              </NeumorphicCard>
            ))
          ) : (
            <NeumorphicCard
              variant="bordered"
              style={styles.activityItem}
              animationDelay={1000}
            >
              <View style={styles.activityRow}>
                <View style={styles.activityIconContainer}>
                  <Clock size={16} color={neumorphicColors.text.tertiary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>No recent activity</Text>
                  <Text style={styles.activitySubtitle}>
                    {isBuyer
                      ? "Place an order to see activity here"
                      : "Create a listing to get started"}
                  </Text>
                </View>
              </View>
            </NeumorphicCard>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  alertBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: neumorphicColors.secondary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  alertText: {
    flex: 1,
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.secondary[700],
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: "47%",
    margin: "1.5%",
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  seeAll: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[600],
    fontWeight: "600",
  },
  // Quick Actions - New Compact Design
  quickActionsSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  quickActionWrapper: {
    alignItems: "center",
    width: QUICK_ACTION_CARD_SIZE,
  },
  quickActionTouchable: {
    alignItems: "center",
    width: "100%",
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    // Subtle shadow for depth
    shadowColor: neumorphicColors.base.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginTop: 2,
  },
  activityItem: {
    marginBottom: spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  activitySubtitle: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  activityRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  activityTime: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
} from "lucide-react-native";

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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const stats = [
    {
      title: "Active Orders",
      value: "12",
      icon: (
        <ShoppingCart
          size={24}
          color={neumorphicColors.primary[600]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.primary[600],
      trend: { value: 8, direction: "up" as const },
    },
    {
      title: "Revenue",
      value: "₦84,500",
      icon: (
        <DollarSign
          size={24}
          color={neumorphicColors.semantic.success}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.semantic.success,
      trend: { value: 12, direction: "up" as const },
    },
    {
      title: "Live Auctions",
      value: "5",
      icon: (
        <Gavel
          size={24}
          color={neumorphicColors.secondary[600]}
          strokeWidth={2}
        />
      ),
      iconColor: neumorphicColors.secondary[600],
      trend: { value: 2, direction: "down" as const },
    },
    {
      title: "Products",
      value: "24",
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

  const quickActions = [
    {
      label: "New Listing",
      icon: (
        <Package
          size={28}
          color={neumorphicColors.primary[600]}
          strokeWidth={1.5}
        />
      ),
      color: neumorphicColors.primary[600],
      route: "/create-listing",
    },
    {
      label: "Auctions",
      icon: (
        <Gavel
          size={28}
          color={neumorphicColors.secondary[600]}
          strokeWidth={1.5}
        />
      ),
      color: neumorphicColors.secondary[600],
      route: "/(tabs)/auctions",
    },
    {
      label: "AgriMall",
      icon: (
        <Store
          size={28}
          color={neumorphicColors.primary[500]}
          strokeWidth={1.5}
        />
      ),
      color: neumorphicColors.primary[500],
      route: "/agrimall",
    },
    {
      label: "Export Hub",
      icon: (
        <Globe
          size={28}
          color={neumorphicColors.semantic.info}
          strokeWidth={1.5}
        />
      ),
      color: neumorphicColors.semantic.info,
      route: "/export-gateway",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "New order received",
      subtitle: "Tomatoes - 50kg",
      time: "5 min ago",
      type: "order",
    },
    {
      id: 2,
      title: "Auction bid placed",
      subtitle: "Maize lot #234",
      time: "1 hour ago",
      type: "auction",
    },
    {
      id: 3,
      title: "Payment received",
      subtitle: "₦25,000",
      time: "2 hours ago",
      type: "payment",
    },
    {
      id: 4,
      title: "Product listed",
      subtitle: "Fresh Cassava",
      time: "1 day ago",
      type: "listing",
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
      default:
        return <AlertCircle size={16} color={neumorphicColors.text.tertiary} />;
    }
  };

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
        {/* Alert Banner */}
        <NeumorphicCard
          variant="glass"
          style={styles.alertBanner}
          animated={true}
          animationDelay={100}
        >
          <View style={styles.alertContent}>
            <View style={styles.alertIconContainer}>
              <AlertCircle size={20} color={neumorphicColors.secondary[600]} />
            </View>
            <Text style={styles.alertText}>3 products need restocking</Text>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TrendingUp size={20} color={neumorphicColors.primary[600]} />
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <NeumorphicCard
                key={index}
                variant="standard"
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                animationDelay={600 + index * 100}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}12` },
                  ]}
                >
                  {action.icon}
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </NeumorphicCard>
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
          {recentActivity.map((activity, index) => (
            <NeumorphicCard
              key={activity.id}
              variant="bordered"
              style={styles.activityItem}
              animationDelay={1000 + index * 100}
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
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </NeumorphicCard>
          ))}
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
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  actionCard: {
    width: "47%",
    margin: "1.5%",
    alignItems: "center",
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  actionLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
    textAlign: "center",
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
  activityTime: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

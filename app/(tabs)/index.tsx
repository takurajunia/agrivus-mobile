import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  TrendingUp,
  Package,
  DollarSign,
  Gavel,
  ShoppingCart,
  BarChart3,
  AlertCircle,
  Leaf,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import GlassCard from "../../src/components/GlassCard";
import { theme } from "../../src/theme/tokens";

export default function HomeScreen() {
  const { user } = useAuth();

  const stats = [
    {
      label: "Active Orders",
      value: "12",
      icon: ShoppingCart,
      color: theme.colors.primary[600],
    },
    {
      label: "Revenue",
      value: "$8,450",
      icon: DollarSign,
      color: theme.colors.secondary[600],
    },
    {
      label: "Live Auctions",
      value: "5",
      icon: Gavel,
      color: theme.colors.secondary[500],
    },
    {
      label: "Products",
      value: "24",
      icon: Package,
      color: theme.colors.primary[700],
    },
  ];

  const quickActions = [
    { label: "New Listing", icon: Package, color: theme.colors.primary[600] },
    { label: "Analytics", icon: BarChart3, color: theme.colors.secondary[600] },
    {
      label: "Marketplace",
      icon: ShoppingCart,
      color: theme.colors.secondary[500],
    },
    { label: "Auctions", icon: Gavel, color: theme.colors.primary[700] },
  ];

  const recentActivity = [
    { title: "New order received", time: "5 min ago", type: "order" },
    { title: "Auction bid placed", time: "1 hour ago", type: "auction" },
    { title: "Payment received", time: "2 hours ago", type: "payment" },
    { title: "Product listed", time: "1 day ago", type: "listing" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "Farmer"}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Leaf
              size={32}
              color={theme.colors.primary[600]}
              strokeWidth={2.5}
            />
          </View>
        </View>

        <GlassCard style={styles.alertBanner} intensity="light">
          <AlertCircle size={20} color={theme.colors.secondary[600]} />
          <Text style={styles.alertText}>3 products need restocking</Text>
        </GlassCard>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <AnimatedCard
              key={index}
              style={styles.statCard}
              delay={index * 100}
              onPress={() => console.log(`Pressed ${stat.label}`)}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${stat.color}15` },
                ]}
              >
                <stat.icon size={24} color={stat.color} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </AnimatedCard>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TrendingUp size={20} color={theme.colors.primary[600]} />
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <AnimatedCard
                key={index}
                style={styles.actionCard}
                delay={400 + index * 100}
                onPress={() => console.log(`Pressed ${action.label}`)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <action.icon size={28} color={action.color} strokeWidth={2} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </AnimatedCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.map((activity, index) => (
            <AnimatedCard
              key={index}
              style={styles.activityItem}
              delay={800 + index * 100}
              variant="bordered"
            >
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </AnimatedCard>
          ))}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.normal,
  },
  userName: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  alertBanner: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  alertText: {
    marginLeft: theme.spacing.md,
    color: theme.colors.secondary[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    width: "47%",
    margin: theme.spacing.xs,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.spacing.xs,
  },
  actionCard: {
    width: "47%",
    margin: theme.spacing.xs,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  activityItem: {
    marginBottom: theme.spacing.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[600],
    marginRight: theme.spacing.lg,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});

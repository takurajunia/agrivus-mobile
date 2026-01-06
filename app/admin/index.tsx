import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Gavel,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  UserX,
  ChevronRight,
  Shield,
  BarChart3,
  ArrowLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
import adminService, { AdminStatistics } from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - spacing.xl * 3) / 2;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminService.getStatistics();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    }
  }, [fetchStats, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `$${num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (user?.role !== "admin") {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.accessDenied}>
          <Shield size={64} color={neumorphicColors.semantic.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to view this page.
          </Text>
          <NeumorphicButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </NeumorphicScreen>
    );
  }

  if (loading) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="dashboard">
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform Overview</Text>
        </View>
      </View>

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
        {/* User Statistics */}
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.statsGrid}>
          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={0}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.primary[100] },
              ]}
            >
              <Users size={24} color={neumorphicColors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.users.total || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={50}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.semantic.success + "20" },
              ]}
            >
              <UserCheck size={24} color={neumorphicColors.semantic.success} />
            </View>
            <Text style={styles.statValue}>
              {stats?.users.activeToday || 0}
            </Text>
            <Text style={styles.statLabel}>Active Today</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={100}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.secondary[100] },
              ]}
            >
              <TrendingUp size={24} color={neumorphicColors.secondary[600]} />
            </View>
            <Text style={styles.statValue}>
              {stats?.users.newThisMonth || 0}
            </Text>
            <Text style={styles.statLabel}>New This Month</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={150}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.semantic.info + "20" },
              ]}
            >
              <Package size={24} color={neumorphicColors.semantic.info} />
            </View>
            <Text style={styles.statValue}>{stats?.users.farmers || 0}</Text>
            <Text style={styles.statLabel}>Farmers</Text>
          </NeumorphicCard>
        </View>

        {/* Orders Statistics */}
        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.statsGrid}>
          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={200}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.primary[100] },
              ]}
            >
              <ShoppingBag size={24} color={neumorphicColors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.total || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={250}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.semantic.warning + "20" },
              ]}
            >
              <Package size={24} color={neumorphicColors.semantic.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={300}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.semantic.info + "20" },
              ]}
            >
              <TrendingUp size={24} color={neumorphicColors.semantic.info} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.inTransit || 0}</Text>
            <Text style={styles.statLabel}>In Transit</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={350}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.semantic.success + "20" },
              ]}
            >
              <UserCheck size={24} color={neumorphicColors.semantic.success} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.delivered || 0}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </NeumorphicCard>
        </View>

        {/* Financial Statistics */}
        <Text style={styles.sectionTitle}>Financials</Text>
        <NeumorphicCard
          style={styles.financialCard}
          animationDelay={400}
          variant="elevated"
        >
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <DollarSign size={24} color={neumorphicColors.semantic.success} />
              <Text style={styles.financialLabel}>Total Volume</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.totalVolume || "0")}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialItem}>
              <TrendingUp size={24} color={neumorphicColors.primary[600]} />
              <Text style={styles.financialLabel}>This Month</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.thisMonthVolume || "0")}
              </Text>
            </View>
          </View>
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <BarChart3 size={24} color={neumorphicColors.semantic.info} />
              <Text style={styles.financialLabel}>Today</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.todayVolume || "0")}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialItem}>
              <DollarSign size={24} color={neumorphicColors.secondary[600]} />
              <Text style={styles.financialLabel}>Avg Order</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.averageOrderValue || "0")}
              </Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Listings & Auctions */}
        <Text style={styles.sectionTitle}>Marketplace</Text>
        <View style={styles.statsGrid}>
          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={450}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.primary[100] },
              ]}
            >
              <Package size={24} color={neumorphicColors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.listings.active || 0}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </NeumorphicCard>

          <NeumorphicCard
            style={[styles.statCard, { width: cardWidth }]}
            animationDelay={500}
            variant="stat"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: neumorphicColors.semantic.warning + "20" },
              ]}
            >
              <Gavel size={24} color={neumorphicColors.semantic.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.auctions.live || 0}</Text>
            <Text style={styles.statLabel}>Live Auctions</Text>
          </NeumorphicCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <NeumorphicCard
            style={styles.actionButton}
            onPress={() => router.push("/admin/users")}
            variant="standard"
          >
            <Users size={20} color={neumorphicColors.primary[600]} />
            <Text style={styles.actionText}>Manage Users</Text>
            <ChevronRight size={16} color={neumorphicColors.text.tertiary} />
          </NeumorphicCard>

          <NeumorphicCard
            style={styles.actionButton}
            onPress={() => router.push("/admin/orders")}
            variant="standard"
          >
            <ShoppingBag size={20} color={neumorphicColors.primary[600]} />
            <Text style={styles.actionText}>View All Orders</Text>
            <ChevronRight size={16} color={neumorphicColors.text.tertiary} />
          </NeumorphicCard>

          <NeumorphicCard
            style={styles.actionButton}
            onPress={() => router.push("/admin/transactions")}
            variant="standard"
          >
            <DollarSign size={20} color={neumorphicColors.primary[600]} />
            <Text style={styles.actionText}>Transactions</Text>
            <ChevronRight size={16} color={neumorphicColors.text.tertiary} />
          </NeumorphicCard>

          <NeumorphicCard
            style={styles.actionButton}
            onPress={() => router.push("/admin/security")}
            variant="standard"
          >
            <AlertTriangle
              size={20}
              color={neumorphicColors.semantic.warning}
            />
            <Text style={styles.actionText}>Security Incidents</Text>
            <ChevronRight size={16} color={neumorphicColors.text.tertiary} />
          </NeumorphicCard>

          <NeumorphicCard
            style={styles.actionButton}
            onPress={() => router.push("/admin/reports")}
            variant="standard"
          >
            <BarChart3 size={20} color={neumorphicColors.primary[600]} />
            <Text style={styles.actionText}>Revenue Reports</Text>
            <ChevronRight size={16} color={neumorphicColors.text.tertiary} />
          </NeumorphicCard>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
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
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  accessDeniedTitle: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  accessDeniedText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTextContainer: {
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  statCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statValue: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  financialCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
  },
  financialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  financialItem: {
    flex: 1,
    alignItems: "center",
  },
  financialLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
  },
  financialValue: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: neumorphicColors.base.shadowDark + "40",
    marginHorizontal: spacing.md,
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionText: {
    flex: 1,
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
    marginLeft: spacing.md,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

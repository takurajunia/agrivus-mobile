import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
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
import AnimatedCard from "../../src/components/AnimatedCard";
import StatCard from "../../src/components/StatCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";
import adminService, { AdminStatistics } from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

const { width } = Dimensions.get("window");
const cardWidth = (width - theme.spacing.xl * 3) / 2;

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
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Shield size={64} color={theme.colors.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to view this page.
          </Text>
          <AnimatedButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View>
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
            colors={[theme.colors.primary[600]]}
          />
        }
      >
        {/* User Statistics */}
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.statsGrid}>
          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={0}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Users size={24} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.users.total || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={50}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.success + "20" },
              ]}
            >
              <UserCheck size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.statValue}>
              {stats?.users.activeToday || 0}
            </Text>
            <Text style={styles.statLabel}>Active Today</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={100}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.secondary[100] },
              ]}
            >
              <TrendingUp size={24} color={theme.colors.secondary[600]} />
            </View>
            <Text style={styles.statValue}>
              {stats?.users.newThisMonth || 0}
            </Text>
            <Text style={styles.statLabel}>New This Month</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={150}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.info + "20" },
              ]}
            >
              <Package size={24} color={theme.colors.info} />
            </View>
            <Text style={styles.statValue}>{stats?.users.farmers || 0}</Text>
            <Text style={styles.statLabel}>Farmers</Text>
          </AnimatedCard>
        </View>

        {/* Orders Statistics */}
        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.statsGrid}>
          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={200}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <ShoppingBag size={24} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.total || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={250}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.warning + "20" },
              ]}
            >
              <Package size={24} color={theme.colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={300}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.info + "20" },
              ]}
            >
              <TrendingUp size={24} color={theme.colors.info} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.inTransit || 0}</Text>
            <Text style={styles.statLabel}>In Transit</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={350}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.success + "20" },
              ]}
            >
              <UserCheck size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.statValue}>{stats?.orders.delivered || 0}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </AnimatedCard>
        </View>

        {/* Financial Statistics */}
        <Text style={styles.sectionTitle}>Financials</Text>
        <AnimatedCard style={styles.financialCard} delay={400}>
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <DollarSign size={24} color={theme.colors.success} />
              <Text style={styles.financialLabel}>Total Volume</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.totalVolume || "0")}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialItem}>
              <TrendingUp size={24} color={theme.colors.primary[600]} />
              <Text style={styles.financialLabel}>This Month</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.thisMonthVolume || "0")}
              </Text>
            </View>
          </View>
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <BarChart3 size={24} color={theme.colors.info} />
              <Text style={styles.financialLabel}>Today</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.todayVolume || "0")}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialItem}>
              <DollarSign size={24} color={theme.colors.secondary[600]} />
              <Text style={styles.financialLabel}>Avg Order</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats?.transactions.averageOrderValue || "0")}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Listings & Auctions */}
        <Text style={styles.sectionTitle}>Marketplace</Text>
        <View style={styles.statsGrid}>
          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={450}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Package size={24} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.listings.active || 0}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </AnimatedCard>

          <AnimatedCard
            style={[styles.statCard, { width: cardWidth }]}
            delay={500}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.warning + "20" },
              ]}
            >
              <Gavel size={24} color={theme.colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.auctions.live || 0}</Text>
            <Text style={styles.statLabel}>Live Auctions</Text>
          </AnimatedCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/users")}
          >
            <Users size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>Manage Users</Text>
            <ChevronRight size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/orders")}
          >
            <ShoppingBag size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>View All Orders</Text>
            <ChevronRight size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/transactions")}
          >
            <DollarSign size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>Transactions</Text>
            <ChevronRight size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/security")}
          >
            <AlertTriangle size={20} color={theme.colors.warning} />
            <Text style={styles.actionText}>Security Incidents</Text>
            <ChevronRight size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/admin/reports")}
          >
            <BarChart3 size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>Revenue Reports</Text>
            <ChevronRight size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
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
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  accessDeniedText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  financialCard: {
    marginHorizontal: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  financialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  financialItem: {
    flex: 1,
    alignItems: "center",
  },
  financialLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  financialValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: theme.spacing.md,
  },
  actionsContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  actionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  bottomPadding: {
    height: theme.spacing["4xl"],
  },
});

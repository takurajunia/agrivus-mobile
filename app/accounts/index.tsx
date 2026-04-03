import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  BarChart3,
  Package,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react-native";
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
} from "../../src/theme/neumorphic";
import adminService, {
  PendingCashDeposit,
} from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

type FinanceSummary = {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  pendingCashDeposits: number;
  totalOrderVolume: number;
  totalCommission: number;
};

type RecentTransaction = {
  id: string;
  type: string;
  amount: string | number;
  description?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
};

const CREDIT_TYPES = new Set([
  "deposit",
  "refund",
  "escrow_release",
  "commission",
]);

const isCredit = (type: string): boolean => {
  return CREDIT_TYPES.has(type.toLowerCase());
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, amount));
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function AccountsOfficerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [summary, setSummary] = useState<FinanceSummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransactions: 0,
    pendingCashDeposits: 0,
    totalOrderVolume: 0,
    totalCommission: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>(
    [],
  );
  const [pendingDeposits, setPendingDeposits] = useState<PendingCashDeposit[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");

  const canAccess =
    user?.role === "accounts_officer" || user?.role === "admin";

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [txnRes, depositRes, revenueRes] = await Promise.allSettled([
        adminService.getAllTransactions({ page: 1, limit: 100 }),
        adminService.getPendingCashDeposits(1, 5),
        adminService.getRevenueReport(),
      ]);

      // ── Transactions ────────────────────────────────────────────────────
      if (txnRes.status === "fulfilled" && txnRes.value.success) {
        const txns = (txnRes.value.data.transactions || []) as any[];
        const total =
          typeof txnRes.value.data.pagination?.total === "number"
            ? txnRes.value.data.pagination.total
            : txns.length;

        const depositTotal = txns
          .filter((t) => String(t.type).toLowerCase() === "deposit")
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        const withdrawalTotal = txns
          .filter((t) => String(t.type).toLowerCase() === "withdrawal")
          .reduce((sum, t) => sum + toNumber(t.amount), 0);

        setSummary((prev) => ({
          ...prev,
          totalDeposits: depositTotal,
          totalWithdrawals: withdrawalTotal,
          totalTransactions: total,
        }));

        setRecentTransactions(
          txns
            .slice(0, 8)
            .map((t) => ({
              id: String(t.id),
              type: String(t.type),
              amount: t.amount,
              description: t.description ?? null,
              user_name: t.user_name ?? t.userName ?? null,
              user_email: t.user_email ?? t.userEmail ?? null,
              created_at: t.created_at ?? null,
              createdAt: t.createdAt ?? null,
            })) as RecentTransaction[],
        );
      }

      // ── Pending cash deposits ───────────────────────────────────────────
      if (depositRes.status === "fulfilled" && depositRes.value.success) {
        const pending = depositRes.value.data.deposits || [];
        setPendingDeposits(pending.slice(0, 5));
        setSummary((prev) => ({
          ...prev,
          pendingCashDeposits:
            typeof depositRes.value.data.pagination?.total === "number"
              ? depositRes.value.data.pagination.total
              : pending.length,
        }));
      }

      // ── Revenue ─────────────────────────────────────────────────────────
      if (revenueRes.status === "fulfilled" && revenueRes.value.success) {
        const revenueData: any = revenueRes.value.data;

        // Backend shape: { daily: [...], summary: {...} }
        if (Array.isArray(revenueData?.daily) && revenueData?.summary) {
          const daily = revenueData.daily as any[];
          const summaryRow = revenueData.summary as Record<string, unknown>;

          const totalOrderVolume = daily.reduce(
            (sum, row) => sum + toNumber(row.total_volume),
            0,
          );

          const totalCommission = toNumber(
            summaryRow.total_earnings ??
              daily.reduce((sum, row) => sum + toNumber(row.total_commission), 0),
          );

          setSummary((prev) => ({
            ...prev,
            totalOrderVolume,
            totalCommission,
          }));
        }
      }
    } catch (err) {
      setError("Failed to load dashboard data. Pull to refresh.");
      console.error("AccountsOfficerDashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!canAccess) return;
    loadDashboard();
  }, [canAccess, loadDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const pendingTotalAmount = useMemo(() => {
    return pendingDeposits.reduce((sum, d) => sum + toNumber(d.amount), 0);
  }, [pendingDeposits]);

  if (!canAccess) {
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
          <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
          <Text style={styles.loadingText}>Loading finance dashboard...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  const renderKpiCard = (
    label: string,
    value: string,
    icon: React.ReactNode,
    urgent?: boolean,
  ) => (
    <NeumorphicCard
      variant="stat"
      style={[styles.kpiCard, urgent ? styles.kpiCardUrgent : undefined]}
    >
      <View style={styles.kpiHeader}>
        <View
          style={[
            styles.kpiIcon,
            {
              backgroundColor: urgent
                ? `${neumorphicColors.semantic.warning}20`
                : `${neumorphicColors.primary[500]}15`,
            },
          ]}
        >
          {icon}
        </View>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      {urgent ? (
        <Text style={styles.kpiHint}>{summary.pendingCashDeposits} pending</Text>
      ) : null}
    </NeumorphicCard>
  );

  const renderTransaction = (txn: RecentTransaction, index: number) => {
    const credit = isCredit(txn.type);
    const created = txn.created_at || txn.createdAt || "";

    return (
      <NeumorphicCard
        key={txn.id || index}
        variant="standard"
        style={styles.listCard}
        animationDelay={index * 40}
        onPress={() => router.push("/admin/transactions")}
      >
        <View style={styles.listRow}>
          <View style={styles.listLeft}>
            <View
              style={[
                styles.listIcon,
                {
                  backgroundColor: `${
                    credit
                      ? neumorphicColors.semantic.success
                      : neumorphicColors.semantic.error
                  }15`,
                },
              ]}
            >
              {credit ? (
                <ArrowDownLeft
                  size={16}
                  color={neumorphicColors.semantic.success}
                />
              ) : (
                <ArrowUpRight size={16} color={neumorphicColors.semantic.error} />
              )}
            </View>
            <View style={styles.listText}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {txn.user_name || "Unknown user"}
              </Text>
              <Text style={styles.listSubtitle} numberOfLines={1}>
                {txn.description || txn.type.replace(/_/g, " ")}
              </Text>
              {!!created && (
                <Text style={styles.listMeta}>{formatDate(created)}</Text>
              )}
            </View>
          </View>

          <View style={styles.listRight}>
            <Text
              style={[
                styles.amount,
                {
                  color: credit
                    ? neumorphicColors.semantic.success
                    : neumorphicColors.semantic.error,
                },
              ]}
            >
              {credit ? "+" : "-"}
              {formatCurrency(toNumber(txn.amount))}
            </Text>
            <Text style={styles.typeBadge}>
              {txn.type.replace(/_/g, " ").toUpperCase()}
            </Text>
          </View>

          <ChevronRight size={18} color={neumorphicColors.text.tertiary} />
        </View>
      </NeumorphicCard>
    );
  };

  const renderDeposit = (deposit: PendingCashDeposit, index: number) => {
    const created = deposit.created_at;
    const reference = deposit.reference || "";

    return (
      <NeumorphicCard
        key={deposit.id}
        variant="standard"
        style={styles.listCard}
        animationDelay={index * 40}
        onPress={() => router.push("/admin/cash-deposits")}
      >
        <View style={styles.listRow}>
          <View style={styles.listLeft}>
            <View
              style={[
                styles.listIcon,
                { backgroundColor: `${neumorphicColors.semantic.warning}15` },
              ]}
            >
              <DollarSign size={16} color={neumorphicColors.semantic.warning} />
            </View>
            <View style={styles.listText}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {deposit.full_name || "Pending deposit"}
              </Text>
              {!!deposit.email && (
                <Text style={styles.listSubtitle} numberOfLines={1}>
                  {deposit.email}
                </Text>
              )}
              {!!reference && (
                <Text style={styles.listMeta} numberOfLines={1}>
                  Ref: {reference.length > 16 ? `${reference.slice(0, 16)}...` : reference}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.listRight}>
            <Text style={[styles.amount, { color: neumorphicColors.semantic.success }]}>
              {formatCurrency(toNumber(deposit.amount))}
            </Text>
            {!!created && <Text style={styles.listMeta}>{formatDate(created)}</Text>}
          </View>

          <ChevronRight size={18} color={neumorphicColors.text.tertiary} />
        </View>
      </NeumorphicCard>
    );
  };

  return (
    <NeumorphicScreen variant="dashboard">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Finance Dashboard</Text>
          <Text style={styles.subtitle}>Accounts Officer</Text>
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
        {!!error && (
          <NeumorphicCard variant="standard" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </NeumorphicCard>
        )}

        {/* KPIs */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.kpiGrid}>
          {renderKpiCard(
            "Total Deposits",
            formatCurrency(summary.totalDeposits),
            <ArrowDownLeft size={18} color={neumorphicColors.semantic.success} />,
          )}
          {renderKpiCard(
            "Total Withdrawals",
            formatCurrency(summary.totalWithdrawals),
            <ArrowUpRight size={18} color={neumorphicColors.semantic.error} />,
          )}
          {renderKpiCard(
            "Transactions",
            summary.totalTransactions.toLocaleString("en-US"),
            <CreditCard size={18} color={neumorphicColors.primary[600]} />,
          )}
          {renderKpiCard(
            "Pending Cash Deposits",
            summary.pendingCashDeposits.toLocaleString("en-US"),
            <DollarSign size={18} color={neumorphicColors.semantic.warning} />,
            summary.pendingCashDeposits > 0,
          )}
          {renderKpiCard(
            "Order Volume",
            formatCurrency(summary.totalOrderVolume),
            <Package size={18} color={neumorphicColors.secondary[600]} />,
          )}
          {renderKpiCard(
            "Platform Commission",
            formatCurrency(summary.totalCommission),
            <BarChart3 size={18} color={neumorphicColors.semantic.info} />,
          )}
        </View>

        {/* Pending Deposits */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending Cash Deposits</Text>
          <NeumorphicButton
            title="View All"
            size="small"
            variant="secondary"
            onPress={() => router.push("/admin/cash-deposits")}
          />
        </View>

        <NeumorphicCard variant="standard" style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Pending Summary</Text>
            <Text style={styles.sectionCardValue}>
              {formatCurrency(pendingTotalAmount)}
            </Text>
          </View>
          {pendingDeposits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No pending deposits</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {pendingDeposits.map(renderDeposit)}
            </View>
          )}
        </NeumorphicCard>

        {/* Recent Transactions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <NeumorphicButton
            title="View All"
            size="small"
            variant="secondary"
            onPress={() => router.push("/admin/transactions")}
          />
        </View>

        {recentTransactions.length === 0 ? (
          <NeumorphicCard variant="standard" style={styles.sectionCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          </NeumorphicCard>
        ) : (
          <View style={styles.listContainer}>
            {recentTransactions.map(renderTransaction)}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <NeumorphicCard
            variant="standard"
            style={styles.actionCard}
            onPress={() => router.push("/admin/cash-deposits")}
          >
            <View style={styles.actionIcon}>
              <DollarSign size={20} color={neumorphicColors.semantic.warning} />
            </View>
            <Text style={styles.actionTitle}>Cash Deposits</Text>
            <Text style={styles.actionSubtitle}>Approve pending</Text>
            {summary.pendingCashDeposits > 0 ? (
              <Text style={styles.actionUrgent}>
                {summary.pendingCashDeposits} pending
              </Text>
            ) : null}
          </NeumorphicCard>

          <NeumorphicCard
            variant="standard"
            style={styles.actionCard}
            onPress={() => router.push("/admin/transactions")}
          >
            <View style={styles.actionIcon}>
              <CreditCard size={20} color={neumorphicColors.primary[600]} />
            </View>
            <Text style={styles.actionTitle}>Transactions</Text>
            <Text style={styles.actionSubtitle}>Wallet activity</Text>
          </NeumorphicCard>

          <NeumorphicCard
            variant="standard"
            style={styles.actionCard}
            onPress={() => router.push("/admin/reports")}
          >
            <View style={styles.actionIcon}>
              <BarChart3 size={20} color={neumorphicColors.semantic.info} />
            </View>
            <Text style={styles.actionTitle}>Revenue Report</Text>
            <Text style={styles.actionSubtitle}>Income & commission</Text>
          </NeumorphicCard>

          <NeumorphicCard
            variant="standard"
            style={styles.actionCard}
            onPress={() => router.push("/admin/orders")}
          >
            <View style={styles.actionIcon}>
              <Package size={20} color={neumorphicColors.secondary[600]} />
            </View>
            <Text style={styles.actionTitle}>Orders</Text>
            <Text style={styles.actionSubtitle}>Reconcile payments</Text>
          </NeumorphicCard>

          <NeumorphicCard
            variant="standard"
            style={styles.actionCard}
            onPress={() => router.push("/admin/users")}
          >
            <View style={styles.actionIcon}>
              <Users size={20} color={neumorphicColors.semantic.success} />
            </View>
            <Text style={styles.actionTitle}>Users</Text>
            <Text style={styles.actionSubtitle}>View & search</Text>
          </NeumorphicCard>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.md,
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
    marginBottom: spacing.sm,
  },
  accessDeniedText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  errorCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: neumorphicColors.semantic.error,
  },
  errorText: {
    ...typography.body,
    color: neumorphicColors.semantic.error,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: neumorphicColors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  kpiCard: {
    width: "48%",
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  kpiCardUrgent: {
    borderWidth: 1,
    borderColor: `${neumorphicColors.semantic.warning}55`,
  },
  kpiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  kpiIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  kpiLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    fontWeight: "600",
    flex: 1,
  },
  kpiValue: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.3,
  },
  kpiHint: {
    ...typography.caption,
    color: neumorphicColors.semantic.warning,
    marginTop: 4,
    fontWeight: "700",
  },
  sectionCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.border,
    marginBottom: spacing.md,
  },
  sectionCardTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  sectionCardValue: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.semantic.success,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyStateText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  listContainer: {
    gap: spacing.sm,
  },
  listCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  listLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  listIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  listText: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  listSubtitle: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  listMeta: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  listRight: {
    alignItems: "flex-end",
    marginRight: spacing.xs,
  },
  amount: {
    ...typography.body,
    fontWeight: "800",
  },
  typeBadge: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 4,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  actionCard: {
    width: "48%",
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: `${neumorphicColors.primary[500]}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  actionSubtitle: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  actionUrgent: {
    ...typography.caption,
    color: neumorphicColors.semantic.warning,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

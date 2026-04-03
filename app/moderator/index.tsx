import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Flag,
  Shield,
  Users,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import adminService, {
  DisputeOutcome,
  ModeratorDashboardData,
} from "../../src/services/adminService";
import {
  NeumorphicBadge,
  NeumorphicButton,
  NeumorphicCard,
  NeumorphicIconButton,
  NeumorphicInput,
  NeumorphicScreen,
} from "../../src/components/neumorphic";
import {
  borderRadius,
  neumorphicColors,
  spacing,
  typography,
} from "../../src/theme/neumorphic";

const OUTCOME_LABELS: Record<DisputeOutcome, string> = {
  favour_buyer: "In favour of Buyer",
  favour_farmer: "In favour of Farmer",
  split: "Split (Equal)",
  escalate_to_admin: "Escalate to Admin",
};

export default function ModeratorDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "support_moderator";
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState<ModeratorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");

  // Dispute resolution state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<DisputeOutcome | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [resolveError, setResolveError] = useState<string>("");
  const [resolveSuccess, setResolveSuccess] = useState<string>("");
  const [resolveLoading, setResolveLoading] = useState(false);

  // Verification state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const nowLabel = useMemo(() => new Date().toLocaleString(), []);

  const formatCurrency = (amount: string | number | null | undefined) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
    if (!Number.isFinite(num)) return "$0";
    return `$${num.toFixed(2)}`;
  };

  const formatRoleLabel = (role: string | null | undefined) => {
    if (!role) return "Unknown";
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const fetchStats = useCallback(async () => {
    try {
      setError("");
      const res = await adminService.getModeratorDashboard();
      if (res.success) setStats(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load moderator dashboard");
    }
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      try {
        setLoading(true);
        await fetchStats();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchStats, isStaff]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const openResolve = useCallback(
    (orderId: string) => {
      setResolveError("");
      setResolveSuccess("");
      if (resolvingId === orderId) {
        setResolvingId(null);
        setOutcome(null);
        setNotes("");
        return;
      }
      setResolvingId(orderId);
      setOutcome(null);
      setNotes("");
    },
    [resolvingId],
  );

  const handleResolveDispute = useCallback(
    async (orderId: string) => {
      setResolveError("");
      setResolveSuccess("");

      if (!outcome) {
        setResolveError("Please select an outcome.");
        return;
      }
      if (!notes.trim()) {
        setResolveError("Please provide resolution notes.");
        return;
      }

      setResolveLoading(true);
      try {
        await adminService.resolveDispute(orderId, outcome, notes.trim());
        const label = OUTCOME_LABELS[outcome] || outcome;
        setResolveSuccess(
          `Dispute for order #${orderId.substring(0, 8)} resolved: ${label}.`,
        );
        setResolvingId(null);
        setOutcome(null);
        setNotes("");
        await fetchStats();
      } catch (err: any) {
        setResolveError(err?.response?.data?.message || "Failed to resolve dispute");
      } finally {
        setResolveLoading(false);
      }
    },
    [fetchStats, notes, outcome],
  );

  const handleVerify = useCallback(
    async (userId: string, verified: boolean) => {
      setVerifyingId(userId);
      try {
        await adminService.verifyUserProfile(
          userId,
          verified,
          verified
            ? "Verified by support moderator"
            : "Verification revoked by moderator",
        );
        await fetchStats();
      } catch (err: any) {
        setError(err?.response?.data?.message || "Verification action failed");
      } finally {
        setVerifyingId(null);
      }
    },
    [fetchStats],
  );

  if (!isStaff) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.accessDenied}>
          <Shield size={64} color={neumorphicColors.semantic.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access the moderator dashboard.
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
          <Text style={styles.title}>{isAdmin ? "Admin" : "Moderator"} Dashboard</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle} numberOfLines={1}>
              Logged in as {user?.fullName}
            </Text>
            <NeumorphicBadge
              label={formatRoleLabel(user?.role)}
              variant={isAdmin ? "error" : "info"}
              size="small"
              style={styles.roleBadge}
            />
          </View>
        </View>
        <Text style={styles.timestamp}>{nowLabel}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {error ? (
          <NeumorphicCard variant="bordered" style={styles.alertError}>
            <Text style={styles.alertErrorText}>⚠️ {error}</Text>
          </NeumorphicCard>
        ) : null}

        {resolveSuccess ? (
          <NeumorphicCard variant="bordered" style={styles.alertSuccess}>
            <Text style={styles.alertSuccessText}>✅ {resolveSuccess}</Text>
          </NeumorphicCard>
        ) : null}

        {/* Summary Cards */}
        <Text style={styles.sectionTitle}>Platform At a Glance</Text>
        <View style={styles.statsGrid}>
          <NeumorphicCard style={styles.statCard} variant="stat" animationDelay={0}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: neumorphicColors.semantic.error + "15" },
              ]}
            >
              <AlertTriangle size={22} color={neumorphicColors.semantic.error} />
            </View>
            <Text style={styles.statValue}>{stats?.summary.disputedOrders ?? 0}</Text>
            <Text style={styles.statLabel}>Disputed Orders</Text>
            <Text style={styles.statHint}>Needs attention</Text>
          </NeumorphicCard>

          <NeumorphicCard style={styles.statCard} variant="stat" animationDelay={50}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: neumorphicColors.semantic.warning + "15" },
              ]}
            >
              <Flag size={22} color={neumorphicColors.semantic.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.summary.flaggedListings ?? 0}</Text>
            <Text style={styles.statLabel}>Flagged Listings</Text>
            <Text style={styles.statHint}>Under review</Text>
          </NeumorphicCard>

          <NeumorphicCard style={styles.statCard} variant="stat" animationDelay={100}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: neumorphicColors.semantic.info + "15" },
              ]}
            >
              <CheckCircle2 size={22} color={neumorphicColors.semantic.info} />
            </View>
            <Text style={styles.statValue}>
              {stats?.summary.pendingVerifications ?? 0}
            </Text>
            <Text style={styles.statLabel}>Pending Verifications</Text>
            <Text style={styles.statHint}>Awaiting review</Text>
          </NeumorphicCard>

          <NeumorphicCard style={styles.statCard} variant="stat" animationDelay={150}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: neumorphicColors.semantic.success + "15" },
              ]}
            >
              <Users size={22} color={neumorphicColors.semantic.success} />
            </View>
            <Text style={styles.statValue}>{stats?.summary.activeUsers24h ?? 0}</Text>
            <Text style={styles.statLabel}>Active Users (24h)</Text>
            <Text style={styles.statHint}>Currently active</Text>
          </NeumorphicCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsList}>
          <NeumorphicCard
            onPress={() => router.push("/admin/users")}
            style={styles.actionCard}
            variant="standard"
          >
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Users size={22} color={neumorphicColors.primary[700]} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Browse Users</Text>
                <Text style={styles.actionSubtitle}>View profiles & verify</Text>
              </View>
            </View>
          </NeumorphicCard>

          <NeumorphicCard
            onPress={() => router.push("/admin/orders")}
            style={styles.actionCard}
            variant="standard"
          >
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <FileText size={22} color={neumorphicColors.primary[700]} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>View Orders</Text>
                <Text style={styles.actionSubtitle}>Monitor & mediate orders</Text>
              </View>
            </View>
          </NeumorphicCard>

          <NeumorphicCard
            onPress={() => router.push("/admin/transactions")}
            style={styles.actionCard}
            variant="standard"
          >
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <TrendingUp size={22} color={neumorphicColors.primary[700]} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Transactions</Text>
                <Text style={styles.actionSubtitle}>Read-only audit view</Text>
              </View>
            </View>
          </NeumorphicCard>

          <NeumorphicCard
            onPress={() => router.push("/moderator/activity-log")}
            style={styles.actionCard}
            variant="bordered"
          >
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Activity size={22} color={neumorphicColors.semantic.info} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>My Activity Log</Text>
                <Text style={styles.actionSubtitle}>Actions I've taken</Text>
              </View>
            </View>
          </NeumorphicCard>
        </View>

        {/* Open Disputes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Open Disputes</Text>
          {(stats?.summary.disputedOrders ?? 0) > 0 ? (
            <NeumorphicBadge
              label={String(stats?.summary.disputedOrders ?? 0)}
              variant="error"
              size="small"
            />
          ) : null}
        </View>
        <NeumorphicCard variant="standard" style={styles.sectionCard}>
          {!stats?.recentDisputes?.length ? (
            <Text style={styles.emptyText}>✅ No open disputes — great work!</Text>
          ) : (
            <View style={styles.list}>
              {stats.recentDisputes.map((dispute) => (
                <View key={dispute.id} style={styles.disputeItem}>
                  <View style={styles.disputeHeaderRow}>
                    <View style={styles.disputeHeaderText}>
                      <Text style={styles.disputeTitle}>
                        Order #{dispute.id.substring(0, 8)}
                      </Text>
                      <Text style={styles.disputeSubTitle}>
                        {(dispute.crop_type || "N/A").toString()} • {formatCurrency(dispute.total_amount)}
                      </Text>
                      <Text style={styles.disputeMeta}>
                        🌾 {dispute.farmer_name || "—"}   🛒 {dispute.buyer_name || "—"}
                      </Text>
                      <Text style={styles.disputeMeta}>
                        📍 {dispute.delivery_location || "—"}
                      </Text>
                    </View>
                    <NeumorphicButton
                      title={resolvingId === dispute.id ? "Cancel" : "Resolve"}
                      onPress={() => openResolve(dispute.id)}
                      variant={resolvingId === dispute.id ? "secondary" : "primary"}
                      size="small"
                      style={styles.resolveButton}
                    />
                  </View>

                  {resolvingId === dispute.id ? (
                    <View style={styles.resolvePanel}>
                      <Text style={styles.resolveTitle}>Resolution Decision</Text>

                      {resolveError ? (
                        <Text style={styles.resolveErrorText}>{resolveError}</Text>
                      ) : null}

                      <View style={styles.outcomeGrid}>
                        {(Object.keys(OUTCOME_LABELS) as DisputeOutcome[]).map((val) => {
                          const selected = outcome === val;
                          return (
                            <NeumorphicButton
                              key={val}
                              title={OUTCOME_LABELS[val]}
                              onPress={() => setOutcome(val)}
                              variant={selected ? "primary" : "secondary"}
                              size="small"
                              disabled={resolveLoading}
                              style={styles.outcomeButton}
                            />
                          );
                        })}
                      </View>

                      <NeumorphicInput
                        label="Resolution notes"
                        placeholder="Resolution notes (required)…"
                        value={notes}
                        onChangeText={setNotes}
                        variant="textarea"
                        editable={!resolveLoading}
                      />

                      {outcome === "escalate_to_admin" ? (
                        <Text style={styles.infoWarning}>
                          ⬆️ This dispute will remain open and flagged for admin financial action.
                        </Text>
                      ) : outcome ? (
                        <Text style={styles.infoNeutral}>
                          ℹ️ Order status will be set to "resolved". An admin must complete the financial settlement.
                        </Text>
                      ) : null}

                      <NeumorphicButton
                        title={resolveLoading ? "Submitting…" : "Submit Resolution"}
                        onPress={() => handleResolveDispute(dispute.id)}
                        variant="primary"
                        disabled={resolveLoading}
                        loading={resolveLoading}
                        fullWidth
                      />
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </NeumorphicCard>

        {/* New Users — Verification Queue */}
        <Text style={styles.sectionTitle}>New Users (Last 48h) — Verification Queue</Text>
        <NeumorphicCard variant="standard" style={styles.sectionCard}>
          {!stats?.recentNewUsers?.length ? (
            <Text style={styles.emptyText}>No new users in the last 48 hours</Text>
          ) : (
            <View style={styles.list}>
              {stats.recentNewUsers.map((u) => {
                const isSaving = verifyingId === u.id;
                return (
                  <View key={u.id} style={styles.userItem}>
                    <View style={styles.userRowTop}>
                      <View style={styles.userText}>
                        <Text style={styles.userName}>{u.full_name}</Text>
                        <Text style={styles.userEmail}>{u.email}</Text>
                        <View style={styles.userBadgesRow}>
                          <NeumorphicBadge
                            label={formatRoleLabel(u.role)}
                            variant="primary"
                            size="small"
                          />
                          <NeumorphicBadge
                            label={u.is_verified ? "Verified" : "Unverified"}
                            variant={u.is_verified ? "success" : "warning"}
                            size="small"
                          />
                        </View>
                        <Text style={styles.userJoined}>
                          Joined {new Date(u.created_at).toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.userActions}>
                        {isSaving ? (
                          <Text style={styles.savingText}>Saving…</Text>
                        ) : u.is_verified ? (
                          <NeumorphicButton
                            title="Unverify"
                            onPress={() => handleVerify(u.id, false)}
                            variant="secondary"
                            size="small"
                          />
                        ) : (
                          <NeumorphicButton
                            title="Verify"
                            onPress={() => handleVerify(u.id, true)}
                            variant="primary"
                            size="small"
                          />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </NeumorphicCard>
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    flexShrink: 1,
  },
  roleBadge: {
    marginTop: 2,
  },
  timestamp: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
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
    gap: spacing.md,
  },
  accessDeniedTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  accessDeniedText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  sectionTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  statCard: {
    width: "48%",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  statHint: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  actionsList: {
    gap: spacing.md,
  },
  actionCard: {
    paddingVertical: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "700",
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  sectionCard: {
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  disputeItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: neumorphicColors.base.input,
    gap: spacing.md,
  },
  disputeHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  disputeHeaderText: {
    flex: 1,
  },
  disputeTitle: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "700",
  },
  disputeSubTitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  disputeMeta: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  resolveButton: {
    alignSelf: "flex-start",
  },
  resolvePanel: {
    borderRadius: borderRadius.lg,
    backgroundColor: neumorphicColors.base.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  resolveTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  resolveErrorText: {
    ...typography.caption,
    color: neumorphicColors.semantic.error,
    backgroundColor: neumorphicColors.badge.error.bg,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  outcomeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  outcomeButton: {
    flexGrow: 1,
    flexBasis: "48%",
  },
  infoWarning: {
    ...typography.caption,
    color: neumorphicColors.badge.warning.text,
    backgroundColor: neumorphicColors.badge.warning.bg,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  infoNeutral: {
    ...typography.caption,
    color: neumorphicColors.badge.info.text,
    backgroundColor: neumorphicColors.badge.info.bg,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  userItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: neumorphicColors.base.input,
  },
  userRowTop: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  userText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  userBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  userJoined: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
  userActions: {
    alignItems: "flex-end",
  },
  savingText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 6,
  },
  alertError: {
    borderColor: neumorphicColors.semantic.error + "40",
    borderWidth: 1,
    marginTop: spacing.md,
  },
  alertErrorText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
  },
  alertSuccess: {
    borderColor: neumorphicColors.semantic.success + "40",
    borderWidth: 1,
    marginTop: spacing.md,
  },
  alertSuccessText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.success,
  },
});

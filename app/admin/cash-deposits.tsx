import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, DollarSign, Shield, XCircle, CheckCircle } from "lucide-react-native";
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
import adminService, { PendingCashDeposit } from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export default function AdminCashDepositsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const canAccess = user?.role === "admin" || user?.role === "accounts_officer";

  const [deposits, setDeposits] = useState<PendingCashDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const totalAmountPending = useMemo(() => {
    return deposits.reduce((sum, d) => sum + toNumber(d.amount), 0);
  }, [deposits]);

  const loadDeposits = useCallback(
    async (pageOverride?: number) => {
      try {
        const page = pageOverride ?? pagination.page;
        const response = await adminService.getPendingCashDeposits(
          page,
          pagination.limit,
        );

        if (response.success) {
          setDeposits(response.data.deposits || []);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error("Failed to load deposits:", error);
        Alert.alert("Error", "Failed to load pending cash deposits");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  useEffect(() => {
    if (!canAccess) return;
    setLoading(true);
    loadDeposits();
  }, [canAccess, loadDeposits]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDeposits(1);
  }, [loadDeposits]);

  const handleApprove = async (paymentId: string) => {
    try {
      setApproving(paymentId);
      const response = await adminService.approveCashDeposit(paymentId, {
        approvalNotes: "Verified by staff",
      });

      if (response.success) {
        setDeposits((prev) => prev.filter((d) => d.id !== paymentId));
        Alert.alert("Approved", "✅ Deposit approved successfully");
      } else {
        Alert.alert("Error", response.message || "Failed to approve deposit");
      }
    } catch (error: any) {
      console.error("Failed to approve deposit:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.error || error?.message || "Failed to approve deposit",
      );
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      Alert.alert("Required", "Please provide a rejection reason.");
      return;
    }

    try {
      setRejecting(paymentId);
      const response = await adminService.rejectCashDeposit(paymentId, {
        rejectionReason: rejectionReason.trim(),
      });

      if (response.success) {
        setDeposits((prev) => prev.filter((d) => d.id !== paymentId));
        setSelectedDeposit(null);
        setRejectionReason("");
        Alert.alert("Rejected", "❌ Deposit rejected successfully");
      } else {
        Alert.alert("Error", response.message || "Failed to reject deposit");
      }
    } catch (error: any) {
      console.error("Failed to reject deposit:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.error || error?.message || "Failed to reject deposit",
      );
    } finally {
      setRejecting(null);
    }
  };

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), Math.max(1, pagination.totalPages));
    setPagination((prev) => ({ ...prev, page: next }));
    setLoading(true);
    loadDeposits(next);
  };

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
          <Text style={styles.title}>Cash Deposits</Text>
          <Text style={styles.subtitle}>Verify pending deposits</Text>
        </View>
      </View>

      {loading && deposits.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
          <Text style={styles.loadingText}>Loading deposits...</Text>
        </View>
      ) : (
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
          {/* Stats */}
          <View style={styles.statsGrid}>
            <NeumorphicCard variant="stat" style={styles.statCard}>
              <Text style={styles.statLabel}>Pending Deposits</Text>
              <Text style={styles.statValue}>{pagination.total}</Text>
            </NeumorphicCard>

            <NeumorphicCard variant="stat" style={styles.statCard}>
              <Text style={styles.statLabel}>Total Amount Pending</Text>
              <Text style={[styles.statValue, { color: neumorphicColors.semantic.success }]}>
                {formatCurrency(totalAmountPending)}
              </Text>
            </NeumorphicCard>

            <NeumorphicCard variant="stat" style={styles.statCard}>
              <Text style={styles.statLabel}>Page</Text>
              <Text style={styles.statValue}>
                {pagination.page} / {Math.max(1, pagination.totalPages)}
              </Text>
            </NeumorphicCard>
          </View>

          {/* Deposits List */}
          <Text style={styles.sectionTitle}>Pending Deposits</Text>

          {deposits.length === 0 ? (
            <NeumorphicCard variant="standard" style={styles.emptyCard}>
              <Text style={styles.emptyText}>🎉 No pending cash deposits.</Text>
            </NeumorphicCard>
          ) : (
            <View style={styles.listContainer}>
              {deposits.map((deposit, index) => {
                const isSelected = selectedDeposit === deposit.id;
                const reference = deposit.reference || "";

                return (
                  <NeumorphicCard
                    key={deposit.id}
                    variant="standard"
                    style={styles.depositCard}
                    animationDelay={index * 40}
                  >
                    <View style={styles.depositHeader}>
                      <View style={styles.userBlock}>
                        <View style={styles.userIcon}>
                          <DollarSign
                            size={18}
                            color={neumorphicColors.semantic.warning}
                          />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.userName} numberOfLines={1}>
                            {deposit.full_name || "Unknown user"}
                          </Text>
                          {!!deposit.email && (
                            <Text style={styles.userEmail} numberOfLines={1}>
                              {deposit.email}
                            </Text>
                          )}
                          {!!reference && (
                            <Text style={styles.reference} numberOfLines={1}>
                              Ref: {reference}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.amountBlock}>
                        <Text style={styles.amountText}>
                          {formatCurrency(toNumber(deposit.amount))}
                        </Text>
                        {!!deposit.created_at && (
                          <Text style={styles.dateText}>
                            {new Date(deposit.created_at).toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.actionsRow}>
                      {isSelected ? (
                        <View style={styles.rejectForm}>
                          <TextInput
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            placeholder="Enter rejection reason..."
                            placeholderTextColor={neumorphicColors.text.tertiary}
                            style={styles.input}
                            multiline
                          />
                          <View style={styles.rejectButtonsRow}>
                            <NeumorphicButton
                              title={
                                rejecting === deposit.id
                                  ? "Rejecting..."
                                  : "Confirm Rejection"
                              }
                              variant="danger"
                              size="small"
                              onPress={() => handleReject(deposit.id)}
                              disabled={rejecting === deposit.id}
                              icon={
                                <XCircle
                                  size={16}
                                  color={neumorphicColors.text.inverse}
                                />
                              }
                            />
                            <NeumorphicButton
                              title="Cancel"
                              variant="secondary"
                              size="small"
                              onPress={() => {
                                setSelectedDeposit(null);
                                setRejectionReason("");
                              }}
                            />
                          </View>
                        </View>
                      ) : (
                        <>
                          <NeumorphicButton
                            title={
                              approving === deposit.id
                                ? "Approving..."
                                : "Approve"
                            }
                            variant="primary"
                            size="small"
                            onPress={() => handleApprove(deposit.id)}
                            disabled={approving === deposit.id}
                            icon={
                              <CheckCircle
                                size={16}
                                color={neumorphicColors.text.inverse}
                              />
                            }
                          />
                          <NeumorphicButton
                            title="Reject"
                            variant="secondary"
                            size="small"
                            onPress={() => setSelectedDeposit(deposit.id)}
                            style={{ borderColor: neumorphicColors.semantic.error }}
                            textStyle={{ color: neumorphicColors.semantic.error }}
                            icon={
                              <XCircle
                                size={16}
                                color={neumorphicColors.semantic.error}
                              />
                            }
                          />
                        </>
                      )}
                    </View>
                  </NeumorphicCard>
                );
              })}
            </View>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 ? (
            <View style={styles.paginationRow}>
              <NeumorphicButton
                title="Previous"
                variant="secondary"
                size="small"
                onPress={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              />
              <Text style={styles.paginationText}>
                Page {pagination.page} of {pagination.totalPages}
              </Text>
              <NeumorphicButton
                title="Next"
                variant="secondary"
                size="small"
                onPress={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              />
            </View>
          ) : null}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  statCard: {
    width: "48%",
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    fontWeight: "700",
  },
  statValue: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.xs,
    fontWeight: "800",
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
  emptyCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  depositCard: {
    padding: spacing.lg,
  },
  depositHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  userBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: `${neumorphicColors.semantic.warning}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    ...typography.body,
    fontWeight: "800",
    color: neumorphicColors.text.primary,
  },
  userEmail: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  reference: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  amountBlock: {
    alignItems: "flex-end",
  },
  amountText: {
    ...typography.body,
    fontWeight: "900",
    color: neumorphicColors.semantic.success,
  },
  dateText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
    textAlign: "right",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  rejectForm: {
    flex: 1,
    gap: spacing.sm,
  },
  input: {
    minHeight: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: neumorphicColors.text.primary,
    backgroundColor: neumorphicColors.base.card,
  },
  rejectButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  paginationRow: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationText: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    fontWeight: "700",
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

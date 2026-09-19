import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Banknote,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicBadge,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import adminService, {
  AdminWithdrawalRequest,
  WithdrawalStatus,
  WithdrawalSummary,
} from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

type StatusFilter = WithdrawalStatus | "all";

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

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const STATUS_BADGE: Record<WithdrawalStatus, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  processing: "info",
  completed: "success",
  rejected: "error",
};

export default function AdminWithdrawalsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const canAccess = user?.role === "admin" || user?.role === "accounts_officer";

  const [requests, setRequests] = useState<AdminWithdrawalRequest[]>([]);
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [actioning, setActioning] = useState<string | null>(null);

  // Complete modal
  const [completeTarget, setCompleteTarget] =
    useState<AdminWithdrawalRequest | null>(null);
  const [paymentReference, setPaymentReference] = useState("");

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<AdminWithdrawalRequest | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await adminService.getWithdrawalQueue(filter);
      if (response.success) {
        setRequests(response.data.requests);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Failed to load withdrawal requests:", error);
      Alert.alert("Error", "Failed to load withdrawal requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!canAccess) return;
    setLoading(true);
    load();
  }, [canAccess, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const markProcessing = async (req: AdminWithdrawalRequest) => {
    try {
      setActioning(req.id);
      const response = await adminService.markWithdrawalProcessing(req.id);
      if (response.success) {
        await load();
      } else {
        Alert.alert("Error", response.message || "Failed to update request");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update request",
      );
    } finally {
      setActioning(null);
    }
  };

  const submitComplete = async () => {
    if (!completeTarget || !paymentReference.trim()) return;
    try {
      setActioning(completeTarget.id);
      const response = await adminService.completeWithdrawal(
        completeTarget.id,
        paymentReference.trim(),
      );
      if (response.success) {
        setCompleteTarget(null);
        setPaymentReference("");
        Alert.alert("Paid", "✅ Withdrawal marked as paid");
        await load();
      } else {
        Alert.alert("Error", response.message || "Failed to complete withdrawal");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to complete withdrawal",
      );
    } finally {
      setActioning(null);
    }
  };

  const submitReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    try {
      setActioning(rejectTarget.id);
      const response = await adminService.rejectWithdrawal(
        rejectTarget.id,
        rejectionReason.trim(),
      );
      if (response.success) {
        setRejectTarget(null);
        setRejectionReason("");
        Alert.alert("Rejected", "❌ Withdrawal rejected — funds returned");
        await load();
      } else {
        Alert.alert("Error", response.message || "Failed to reject withdrawal");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to reject withdrawal",
      );
    } finally {
      setActioning(null);
    }
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
          <Text style={styles.title}>Withdrawal Requests</Text>
          <Text style={styles.subtitle}>
            Send the money, then record the reference here
          </Text>
        </View>
      </View>

      {loading && requests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
          <Text style={styles.loadingText}>Loading requests...</Text>
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
          {/* Summary */}
          {summary && (
            <View style={styles.statsGrid}>
              {(["pending", "processing", "completed", "rejected"] as const).map(
                (s) => (
                  <NeumorphicCard key={s} variant="stat" style={styles.statCard}>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color:
                            s === "pending"
                              ? neumorphicColors.semantic.warning
                              : s === "processing"
                                ? neumorphicColors.semantic.info
                                : s === "completed"
                                  ? neumorphicColors.semantic.success
                                  : neumorphicColors.semantic.error,
                        },
                      ]}
                    >
                      {summary[s].count}
                    </Text>
                    <Text style={styles.statLabel}>{s}</Text>
                    <Text style={styles.statSub}>
                      {formatCurrency(summary[s].total)}
                    </Text>
                  </NeumorphicCard>
                ),
              )}
            </View>
          )}

          {/* Filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.filterRowContent}
          >
            {FILTER_TABS.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setFilter(t.key)}
                style={[
                  styles.filterTab,
                  filter === t.key && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === t.key && styles.filterTabTextActive,
                  ]}
                >
                  {t.label}
                  {summary && t.key !== "all" && summary[t.key].count > 0
                    ? ` (${summary[t.key].count})`
                    : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* List */}
          {requests.length === 0 ? (
            <NeumorphicCard variant="standard" style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No {filter === "all" ? "" : filter} withdrawal requests
              </Text>
            </NeumorphicCard>
          ) : (
            <View style={styles.listContainer}>
              {requests.map((req, index) => (
                <NeumorphicCard
                  key={req.id}
                  variant="standard"
                  style={styles.reqCard}
                  animationDelay={index * 40}
                >
                  <View style={styles.reqHeader}>
                    <View style={styles.userBlock}>
                      <View style={styles.userIcon}>
                        <Banknote
                          size={18}
                          color={neumorphicColors.semantic.warning}
                        />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.amountRow}>
                          <Text style={styles.amountText}>
                            {formatCurrency(toNumber(req.amount))}
                          </Text>
                          <NeumorphicBadge
                            label={req.status}
                            variant={STATUS_BADGE[req.status]}
                            size="small"
                          />
                        </View>
                        <Text style={styles.userName} numberOfLines={1}>
                          {req.user_name} · via {req.withdrawal_method}
                        </Text>
                        <Text style={styles.userEmail} numberOfLines={1}>
                          {req.user_email}
                          {req.user_phone ? ` · ${req.user_phone}` : ""}
                        </Text>
                        <Text style={styles.reference} numberOfLines={1}>
                          Send to: {req.account_details}
                        </Text>
                        <Text style={styles.dateText}>
                          Requested {new Date(req.created_at).toLocaleString()}
                        </Text>
                        <Text style={styles.dateText}>
                          Balance: {formatCurrency(toNumber(req.wallet_balance))}
                          {" · "}
                          Escrow: {formatCurrency(toNumber(req.wallet_escrow))}
                        </Text>

                        {req.payment_reference && (
                          <Text style={styles.paidText}>
                            Paid — reference: {req.payment_reference}
                            {req.processed_by_name
                              ? ` · by ${req.processed_by_name}`
                              : ""}
                          </Text>
                        )}
                        {req.rejection_reason && (
                          <Text style={styles.rejectedText}>
                            Rejected: {req.rejection_reason}
                            {req.processed_by_name
                              ? ` · by ${req.processed_by_name}`
                              : ""}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {(req.status === "pending" || req.status === "processing") && (
                    <View style={styles.actionsRow}>
                      {req.status === "pending" && (
                        <NeumorphicButton
                          title="Mark Processing"
                          variant="secondary"
                          size="small"
                          onPress={() => markProcessing(req)}
                          disabled={actioning === req.id}
                          icon={
                            <RefreshCw
                              size={16}
                              color={neumorphicColors.primary[600]}
                            />
                          }
                        />
                      )}
                      <NeumorphicButton
                        title="Mark Paid"
                        variant="primary"
                        size="small"
                        onPress={() => {
                          setCompleteTarget(req);
                          setPaymentReference("");
                        }}
                        disabled={actioning === req.id}
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
                        onPress={() => {
                          setRejectTarget(req);
                          setRejectionReason("");
                        }}
                        disabled={actioning === req.id}
                        style={{ borderColor: neumorphicColors.semantic.error }}
                        textStyle={{ color: neumorphicColors.semantic.error }}
                        icon={
                          <XCircle
                            size={16}
                            color={neumorphicColors.semantic.error}
                          />
                        }
                      />
                    </View>
                  )}
                </NeumorphicCard>
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Complete modal */}
      <Modal
        visible={!!completeTarget}
        animationType="slide"
        transparent
        onRequestClose={() => setCompleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mark as Paid</Text>
            {completeTarget && (
              <Text style={styles.modalSubtitle}>
                {formatCurrency(toNumber(completeTarget.amount))} to{" "}
                {completeTarget.user_name} via {completeTarget.withdrawal_method}
                {" — "}
                {completeTarget.account_details}
              </Text>
            )}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Only do this AFTER the money has actually been sent. This
                deducts the farmer's balance and cannot be undone.
              </Text>
            </View>

            <Text style={styles.inputLabel}>Payment Reference *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="EcoCash / bank transaction ID"
              placeholderTextColor={neumorphicColors.text.tertiary}
              value={paymentReference}
              onChangeText={setPaymentReference}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <NeumorphicButton
                title="Cancel"
                variant="tertiary"
                onPress={() => {
                  setCompleteTarget(null);
                  setPaymentReference("");
                }}
                style={styles.modalButton}
                disabled={!!actioning}
              />
              <NeumorphicButton
                title={actioning === completeTarget?.id ? "Saving…" : "Confirm Paid"}
                variant="primary"
                onPress={submitComplete}
                loading={actioning === completeTarget?.id}
                style={styles.modalButton}
                disabled={!paymentReference.trim() || !!actioning}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject modal */}
      <Modal
        visible={!!rejectTarget}
        animationType="slide"
        transparent
        onRequestClose={() => setRejectTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Withdrawal</Text>
            {rejectTarget && (
              <Text style={styles.modalSubtitle}>
                {formatCurrency(toNumber(rejectTarget.amount))} from{" "}
                {rejectTarget.user_name} — the funds will be returned to their
                wallet automatically.
              </Text>
            )}

            <Text style={styles.inputLabel}>
              Reason * (the farmer will see this)
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Account details do not match the registered name"
              placeholderTextColor={neumorphicColors.text.tertiary}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <NeumorphicButton
                title="Cancel"
                variant="tertiary"
                onPress={() => {
                  setRejectTarget(null);
                  setRejectionReason("");
                }}
                style={styles.modalButton}
                disabled={!!actioning}
              />
              <NeumorphicButton
                title={
                  actioning === rejectTarget?.id ? "Rejecting…" : "Reject & Refund"
                }
                variant="danger"
                onPress={submitReject}
                loading={actioning === rejectTarget?.id}
                style={styles.modalButton}
                disabled={!rejectionReason.trim() || !!actioning}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
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
    alignItems: "center",
  },
  statValue: {
    ...typography.h3,
    fontWeight: "800",
  },
  statLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  statSub: {
    ...typography.caption,
    color: neumorphicColors.text.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  filterRow: {
    marginTop: spacing.sm,
  },
  filterRowContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.input,
  },
  filterTabActive: {
    backgroundColor: neumorphicColors.primary[600],
  },
  filterTabText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: neumorphicColors.text.inverse,
  },
  emptyCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
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
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  reqCard: {
    padding: spacing.lg,
  },
  reqHeader: {
    flexDirection: "row",
  },
  userBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
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
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  amountText: {
    ...typography.body,
    fontWeight: "900",
    color: neumorphicColors.text.primary,
  },
  userName: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    marginTop: spacing.xs,
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
  dateText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  paidText: {
    ...typography.caption,
    color: neumorphicColors.semantic.success,
    marginTop: spacing.sm,
  },
  rejectedText: {
    ...typography.caption,
    color: neumorphicColors.semantic.error,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: neumorphicColors.base.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: 40,
  },
  modalTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  warningBox: {
    backgroundColor: neumorphicColors.badge.warning.bg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningText: {
    ...typography.bodySmall,
    color: neumorphicColors.badge.warning.text,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
});

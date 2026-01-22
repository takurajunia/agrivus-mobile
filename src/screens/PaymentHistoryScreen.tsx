import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Filter,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { paymentService } from "../services/paymentService";
import type { PaymentHistoryItem } from "../types";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
} from "../components/neumorphic";
import LoadingSpinner from "../components/LoadingSpinner";

type FilterType = "all" | "completed" | "pending" | "failed";

export default function PaymentHistoryScreen() {
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    loadPaymentHistory();
  }, [filter]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getHistory({
        page: 1,
        limit: 50,
        status: filter === "all" ? undefined : filter,
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Failed to load payment history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPaymentHistory();
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        icon: React.ComponentType<any>;
        color: string;
        bgColor: string;
        label: string;
      }
    > = {
      completed: {
        icon: CheckCircle,
        color: neumorphicColors.semantic.success,
        bgColor: neumorphicColors.semantic.success + "15",
        label: "✓ Completed",
      },
      pending: {
        icon: Clock,
        color: neumorphicColors.semantic.warning,
        bgColor: neumorphicColors.semantic.warning + "15",
        label: "⏳ Pending",
      },
      processing: {
        icon: Clock,
        color: neumorphicColors.semantic.info,
        bgColor: neumorphicColors.semantic.info + "15",
        label: "🔄 Processing",
      },
      failed: {
        icon: XCircle,
        color: neumorphicColors.semantic.error,
        bgColor: neumorphicColors.semantic.error + "15",
        label: "✗ Failed",
      },
      cancelled: {
        icon: XCircle,
        color: neumorphicColors.text.secondary,
        bgColor: neumorphicColors.base.pressed,
        label: "⊘ Cancelled",
      },
    };

    return (
      configs[status] || {
        icon: Clock,
        color: neumorphicColors.text.secondary,
        bgColor: neumorphicColors.base.pressed,
        label: status,
      }
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "ecocash":
      case "onemoney":
      case "telecash":
        return Smartphone;
      case "zipit":
      case "usd_bank":
        return Banknote;
      case "card":
        return CreditCard;
      default:
        return CreditCard;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !refreshing) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="dashboard">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={neumorphicColors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Payment History</Text>
          <Text style={styles.subtitle}>
            View all your payment transactions
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {(["all", "completed", "pending", "failed"] as FilterType[]).map(
            (filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterChip,
                  filter === filterOption && styles.filterChipActive,
                ]}
                onPress={() => setFilter(filterOption)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === filterOption && styles.filterChipTextActive,
                  ]}
                >
                  {filterOption === "all"
                    ? "All Payments"
                    : filterOption.charAt(0).toUpperCase() +
                      filterOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      {/* Payments List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {payments.length === 0 ? (
          <NeumorphicCard variant="standard" style={styles.emptyCard}>
            <CreditCard
              size={48}
              color={neumorphicColors.text.tertiary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No payment transactions found</Text>
            <Text style={styles.emptyText}>
              Your payment history will appear here
            </Text>
          </NeumorphicCard>
        ) : (
          payments.map((payment, index) => {
            const statusConfig = getStatusConfig(payment.status);
            const StatusIcon = statusConfig.icon;
            const MethodIcon = getPaymentMethodIcon(payment.paymentMethod);

            return (
              <NeumorphicCard
                key={payment.id}
                variant="standard"
                style={styles.paymentCard}
                animationDelay={index * 50}
              >
                <View style={styles.paymentHeader}>
                  <View style={styles.methodIconContainer}>
                    <MethodIcon
                      size={24}
                      color={neumorphicColors.primary[600]}
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleRow}>
                      <Text style={styles.paymentType}>
                        {payment.type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusConfig.bgColor },
                        ]}
                      >
                        <StatusIcon size={12} color={statusConfig.color} />
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusConfig.color },
                          ]}
                        >
                          {statusConfig.label.split(" ")[1]}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.paymentMethod}>
                      {paymentService.formatPaymentMethod(
                        payment.paymentMethod,
                      )}{" "}
                      Payment
                    </Text>
                    <Text style={styles.paymentReference}>
                      Ref: {payment.reference}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {formatDate(payment.createdAt)}
                    </Text>
                    {payment.completedAt && (
                      <Text style={styles.completedDate}>
                        ✓ Completed: {formatDate(payment.completedAt)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountValue}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </Text>
                    <Text style={styles.amountCurrency}>
                      {payment.currency}
                    </Text>
                  </View>
                </View>

                {/* Instructions for pending manual payments */}
                {payment.instructions && payment.status === "pending" && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>
                      Payment Instructions:
                    </Text>
                    <Text style={styles.instructionsText}>
                      {payment.instructions}
                    </Text>
                  </View>
                )}
              </NeumorphicCard>
            );
          })
        )}
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neumorphicColors.base.input,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },

  // Filters
  filtersContainer: {
    paddingBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.input,
    borderWidth: 1,
    borderColor: neumorphicColors.base.pressed,
  },
  filterChipActive: {
    backgroundColor: neumorphicColors.primary[600],
    borderColor: neumorphicColors.primary[600],
  },
  filterChipText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
  },
  filterChipTextActive: {
    color: neumorphicColors.text.inverse,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
    gap: spacing.md,
  },

  // Empty State
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // Payment Card
  paymentCard: {
    padding: spacing.md,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  paymentType: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
  },
  paymentMethod: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  paymentReference: {
    ...typography.caption,
    fontFamily: "monospace",
    color: neumorphicColors.text.tertiary,
    marginBottom: spacing.xs,
  },
  paymentDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },
  completedDate: {
    ...typography.caption,
    color: neumorphicColors.semantic.success,
    marginTop: spacing.xs,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountValue: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  amountCurrency: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },

  // Instructions
  instructionsContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.primary[200],
  },
  instructionsTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.primary[700],
    marginBottom: spacing.xs,
  },
  instructionsText: {
    ...typography.caption,
    color: neumorphicColors.primary[600],
    fontFamily: "monospace",
  },
});

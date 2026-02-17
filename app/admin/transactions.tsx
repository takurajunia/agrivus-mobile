import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Wallet,
  Building,
  Filter,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicSearchBar,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import adminService from "../../src/services/adminService";

type TransactionType = "all" | "payment" | "withdrawal" | "refund" | "escrow";
type TransactionStatus = "all" | "completed" | "pending" | "failed";

// Extended transaction type for admin view with additional display fields
interface AdminTransaction {
  id: string;
  reference?: string;
  type: string;
  amount: string | number;
  fee?: number;
  status?: string;
  userName?: string;
  userEmail?: string;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
  userId?: string;
  orderId?: string;
}

export default function AdminTransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType>("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalVolume, setTotalVolume] = useState(0);

  const typeTabs: { key: TransactionType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "payment", label: "Payments" },
    { key: "withdrawal", label: "Withdrawals" },
    { key: "refund", label: "Refunds" },
    { key: "escrow", label: "Escrow" },
  ];

  const fetchTransactions = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setPage(1);
        }

        const params: Record<string, string | number> = {
          page: refresh ? 1 : page,
          limit: 20,
        };

        if (typeFilter !== "all") {
          params.type = typeFilter;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await adminService.getAllTransactions(params);

        if (response.success) {
          const newTransactions = (response.data.transactions ||
            []) as AdminTransaction[];
          if (refresh || page === 1) {
            setTransactions(newTransactions);
          } else {
            setTransactions((prev) => [...prev, ...newTransactions]);
          }
          setHasMore(newTransactions.length === 20);
          setTotalVolume(parseFloat(String(response.data.totalVolume || 0)));
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        Alert.alert("Error", "Failed to load transactions");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, typeFilter, statusFilter, searchQuery]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchTransactions(true);
  }, [typeFilter, statusFilter, searchQuery]);

  const handleRefresh = useCallback(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "payment":
        return (
          <ArrowDownLeft size={16} color={neumorphicColors.semantic.success} />
        );
      case "withdrawal":
        return (
          <ArrowUpRight size={16} color={neumorphicColors.semantic.error} />
        );
      case "refund":
        return (
          <ArrowDownLeft size={16} color={neumorphicColors.semantic.warning} />
        );
      case "escrow":
        return <Clock size={16} color={neumorphicColors.semantic.info} />;
      default:
        return <DollarSign size={16} color={neumorphicColors.text.tertiary} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <CheckCircle size={14} color={neumorphicColors.semantic.success} />
        );
      case "pending":
        return <Clock size={14} color={neumorphicColors.semantic.warning} />;
      case "failed":
        return <XCircle size={14} color={neumorphicColors.semantic.error} />;
      default:
        return <Clock size={14} color={neumorphicColors.text.tertiary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return neumorphicColors.semantic.success;
      case "pending":
        return neumorphicColors.semantic.warning;
      case "failed":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "payment":
        return neumorphicColors.semantic.success;
      case "withdrawal":
        return neumorphicColors.semantic.error;
      case "refund":
        return neumorphicColors.semantic.warning;
      case "escrow":
        return neumorphicColors.semantic.info;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard size={12} color={neumorphicColors.text.tertiary} />;
      case "wallet":
        return <Wallet size={12} color={neumorphicColors.text.tertiary} />;
      case "bank":
        return <Building size={12} color={neumorphicColors.text.tertiary} />;
      default:
        return <DollarSign size={12} color={neumorphicColors.text.tertiary} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTransaction = (transaction: AdminTransaction, index: number) => (
    <NeumorphicCard
      key={transaction.id}
      style={styles.transactionCard}
      animationDelay={index * 50}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.typeContainer}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: `${getTypeColor(transaction.type)}15` },
            ]}
          >
            {getTypeIcon(transaction.type)}
          </View>
          <View>
            <Text style={styles.reference}>
              {transaction.reference || transaction.id.slice(-8)}
            </Text>
            <Text style={styles.typeText}>{transaction.type}</Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              {
                color:
                  transaction.type === "withdrawal"
                    ? neumorphicColors.semantic.error
                    : neumorphicColors.semantic.success,
              },
            ]}
          >
            {transaction.type === "withdrawal" ? "-" : "+"}
            {formatCurrency(
              typeof transaction.amount === "string"
                ? parseFloat(transaction.amount)
                : transaction.amount
            )}
          </Text>
          {(transaction.fee || 0) > 0 && (
            <Text style={styles.fee}>
              Fee: {formatCurrency(transaction.fee || 0)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <User size={14} color={neumorphicColors.text.tertiary} />
          <Text style={styles.detailText}>
            {transaction.userName || "Unknown User"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          {getPaymentMethodIcon(transaction.paymentMethod || "")}
          <Text style={styles.detailText}>
            {transaction.paymentMethod || "N/A"}
          </Text>
        </View>

        {transaction.description && (
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
        )}
      </View>

      <View style={styles.transactionFooter}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={neumorphicColors.text.tertiary} />
          <Text style={styles.dateText}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${getStatusColor(
                transaction.status || "pending"
              )}15`,
            },
          ]}
        >
          {getStatusIcon(transaction.status || "pending")}
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(transaction.status || "pending") },
            ]}
          >
            {transaction.status || "pending"}
          </Text>
        </View>
      </View>
    </NeumorphicCard>
  );

  return (
    <NeumorphicScreen variant="list" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Total Volume Card */}
      <View style={styles.volumeCard}>
        <Text style={styles.volumeLabel}>Total Volume</Text>
        <Text style={styles.volumeValue}>{formatCurrency(totalVolume)}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search by reference or user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {typeTabs.map((tab) => (
          <NeumorphicButton
            key={tab.key}
            title={tab.label}
            variant={typeFilter === tab.key ? "primary" : "secondary"}
            size="small"
            onPress={() => setTypeFilter(tab.key)}
            style={styles.tab}
          />
        ))}
      </ScrollView>

      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        <Filter size={16} color={neumorphicColors.text.tertiary} />
        <Text style={styles.filterLabel}>Status:</Text>
        {(["all", "completed", "pending", "failed"] as TransactionStatus[]).map(
          (status) => (
            <NeumorphicButton
              key={status}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
              variant={statusFilter === status ? "primary" : "tertiary"}
              size="small"
              onPress={() => setStatusFilter(status)}
              style={styles.statusFilterChip}
            />
          )
        )}
      </View>

      {/* Transactions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[neumorphicColors.primary[600]]}
              tintColor={neumorphicColors.primary[600]}
            />
          }
        >
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign
                size={64}
                color={neumorphicColors.text.tertiary}
                strokeWidth={1}
              />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "No transactions match the current filters"}
              </Text>
            </View>
          ) : (
            <>
              {transactions.map((transaction, index) =>
                renderTransaction(transaction, index)
              )}

              {hasMore && (
                <NeumorphicButton
                  title="Load More"
                  variant="secondary"
                  size="medium"
                  style={styles.loadMoreButton}
                  onPress={() => {
                    setPage((prev) => prev + 1);
                    fetchTransactions();
                  }}
                />
              )}
            </>
          )}
        </ScrollView>
      )}
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h4,
  },
  placeholder: {
    width: 48,
  },
  volumeCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    backgroundColor: neumorphicColors.primary[600],
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  volumeLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[100],
    marginBottom: spacing.xs,
  },
  volumeValue: {
    ...typography.h2,
    color: neumorphicColors.text.inverse,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    marginRight: spacing.sm,
  },
  statusFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterLabel: {
    ...typography.bodySmall,
    marginRight: spacing.xs,
  },
  statusFilterChip: {
    marginRight: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
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
  transactionCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  reference: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  typeText: {
    ...typography.caption,
    textTransform: "capitalize",
    marginTop: 2,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    ...typography.h5,
    fontWeight: "700",
  },
  fee: {
    ...typography.caption,
    marginTop: 2,
  },
  transactionDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
  },
  description: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  dateText: {
    ...typography.caption,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: spacing.md,
  },
});

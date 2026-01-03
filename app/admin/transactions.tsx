import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import ModernInput from "../../src/components/ModernInput";
import { theme } from "../../src/theme/tokens";
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

        const params: any = {
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
        return <ArrowDownLeft size={16} color={theme.colors.success} />;
      case "withdrawal":
        return <ArrowUpRight size={16} color={theme.colors.error} />;
      case "refund":
        return <ArrowDownLeft size={16} color={theme.colors.warning} />;
      case "escrow":
        return <Clock size={16} color={theme.colors.info} />;
      default:
        return <DollarSign size={16} color={theme.colors.text.tertiary} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle size={14} color={theme.colors.success} />;
      case "pending":
        return <Clock size={14} color={theme.colors.warning} />;
      case "failed":
        return <XCircle size={14} color={theme.colors.error} />;
      default:
        return <Clock size={14} color={theme.colors.text.tertiary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "failed":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "payment":
        return theme.colors.success;
      case "withdrawal":
        return theme.colors.error;
      case "refund":
        return theme.colors.warning;
      case "escrow":
        return theme.colors.info;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard size={12} color={theme.colors.text.tertiary} />;
      case "wallet":
        return <Wallet size={12} color={theme.colors.text.tertiary} />;
      case "bank":
        return <Building size={12} color={theme.colors.text.tertiary} />;
      default:
        return <DollarSign size={12} color={theme.colors.text.tertiary} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTransaction = (transaction: AdminTransaction, index: number) => (
    <AnimatedCard
      key={transaction.id}
      style={styles.transactionCard}
      delay={index * 50}
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
                    ? theme.colors.error
                    : theme.colors.success,
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
          <User size={14} color={theme.colors.text.tertiary} />
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
          <Calendar size={14} color={theme.colors.text.tertiary} />
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
    </AnimatedCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
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
        <ModernInput
          placeholder="Search by reference or user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
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
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, typeFilter === tab.key && styles.activeTab]}
            onPress={() => setTypeFilter(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                typeFilter === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        <Filter size={16} color={theme.colors.text.tertiary} />
        <Text style={styles.filterLabel}>Status:</Text>
        {(["all", "completed", "pending", "failed"] as TransactionStatus[]).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterChip,
                statusFilter === status && styles.activeStatusFilter,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  statusFilter === status && styles.activeStatusFilterText,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Transactions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
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
              colors={[theme.colors.primary[600]]}
              tintColor={theme.colors.primary[600]}
            />
          }
        >
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign
                size={64}
                color={theme.colors.text.tertiary}
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
                <AnimatedButton
                  title="Load More"
                  variant="outline"
                  size="md"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  volumeCard: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
  },
  volumeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[100],
    marginBottom: theme.spacing.xs,
  },
  volumeValue: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  statusFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  statusFilterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
  },
  activeStatusFilter: {
    backgroundColor: theme.colors.secondary[600],
  },
  statusFilterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  activeStatusFilterText: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
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
  transactionCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  reference: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  typeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: "capitalize",
    marginTop: 2,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  fee: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  transactionDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  dateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: theme.spacing.md,
  },
});

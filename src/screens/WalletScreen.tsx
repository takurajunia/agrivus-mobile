import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Lock,
  DollarSign,
  CreditCard,
  Smartphone,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import { walletService } from "../services/walletService";
import type { WalletBalance, Transaction } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";
import GlassCard from "../components/GlassCard";

const PAYMENT_METHODS = [
  { id: "ecocash", name: "EcoCash", icon: Smartphone },
  { id: "onemoney", name: "OneMoney", icon: Smartphone },
  { id: "innbucks", name: "InnBucks", icon: Smartphone },
  { id: "bank", name: "Bank Transfer", icon: CreditCard },
];

export default function WalletScreen() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ecocash");
  const [accountDetails, setAccountDetails] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      await walletService.deposit(parseFloat(depositAmount), paymentMethod);
      setShowDepositModal(false);
      setDepositAmount("");
      loadWalletData();
      Alert.alert("Success", "Funds deposited successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Deposit failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!accountDetails) {
      Alert.alert("Error", "Please enter your account details");
      return;
    }

    try {
      setProcessing(true);
      await walletService.withdraw(
        parseFloat(withdrawAmount),
        paymentMethod,
        accountDetails
      );
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setAccountDetails("");
      loadWalletData();
      Alert.alert("Success", "Withdrawal request submitted!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Withdrawal failed"
      );
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return { icon: ArrowDownCircle, color: theme.colors.success };
      case "payment":
        return { icon: DollarSign, color: theme.colors.success };
      case "withdrawal":
        return { icon: ArrowUpCircle, color: theme.colors.error };
      case "escrow_hold":
        return { icon: Lock, color: theme.colors.warning };
      case "escrow_release":
        return { icon: Lock, color: theme.colors.info };
      default:
        return { icon: DollarSign, color: theme.colors.text.secondary };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <Wallet size={28} color={theme.colors.primary[600]} />
          <Text style={styles.title}>My Wallet</Text>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceCards}>
          <GlassCard style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              ${balance?.balance.toLocaleString() || "0.00"}
            </Text>
            <Text style={styles.currency}>{balance?.currency || "USD"}</Text>
          </GlassCard>

          <View style={styles.smallCardsRow}>
            <AnimatedCard style={styles.smallCard}>
              <Lock size={20} color={theme.colors.secondary[600]} />
              <Text style={styles.smallCardLabel}>In Escrow</Text>
              <Text style={styles.smallCardAmount}>
                ${balance?.escrowBalance.toLocaleString() || "0.00"}
              </Text>
            </AnimatedCard>

            <AnimatedCard style={styles.smallCard}>
              <DollarSign size={20} color={theme.colors.info} />
              <Text style={styles.smallCardLabel}>Available</Text>
              <Text style={styles.smallCardAmount}>
                ${balance?.availableBalance.toLocaleString() || "0.00"}
              </Text>
            </AnimatedCard>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
            onPress={() => setShowDepositModal(true)}
          >
            <ArrowDownCircle size={24} color={theme.colors.text.inverse} />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => setShowWithdrawModal(true)}
          >
            <ArrowUpCircle size={24} color={theme.colors.primary[600]} />
            <Text style={[styles.actionButtonText, styles.withdrawButtonText]}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Clock size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>Deposit funds to get started</Text>
            </View>
          ) : (
            transactions.map((tx) => {
              const { icon: Icon, color } = getTransactionIcon(tx.type);
              const isPositive = [
                "deposit",
                "payment",
                "escrow_release",
              ].includes(tx.type);

              return (
                <AnimatedCard key={tx.id} style={styles.transactionCard}>
                  <View
                    style={[
                      styles.txIconContainer,
                      { backgroundColor: color + "15" },
                    ]}
                  >
                    <Icon size={24} color={color} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDescription}>{tx.description}</Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.createdAt).toLocaleDateString()} at{" "}
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.txAmountContainer}>
                    <Text
                      style={[
                        styles.txAmount,
                        {
                          color: isPositive
                            ? theme.colors.success
                            : theme.colors.error,
                        },
                      ]}
                    >
                      {isPositive ? "+" : "-"}$
                      {parseFloat(tx.amount).toLocaleString()}
                    </Text>
                    <Text style={styles.txBalance}>
                      Bal: ${parseFloat(tx.balanceAfter).toLocaleString()}
                    </Text>
                  </View>
                </AnimatedCard>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deposit Funds</Text>

            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />
            </View>

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method.id && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                >
                  <method.icon
                    size={20}
                    color={
                      paymentMethod === method.id
                        ? theme.colors.primary[600]
                        : theme.colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method.id &&
                        styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDepositModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeposit}
                disabled={processing}
              >
                {processing ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Deposit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>

            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
            </View>

            <Text style={styles.inputLabel}>Withdrawal Method</Text>
            <View style={styles.paymentMethods}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method.id && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                >
                  <method.icon
                    size={20}
                    color={
                      paymentMethod === method.id
                        ? theme.colors.primary[600]
                        : theme.colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method.id &&
                        styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Account Details</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter phone number or account number"
              value={accountDetails}
              onChangeText={setAccountDetails}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowWithdrawModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleWithdraw}
                disabled={processing}
              >
                {processing ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Withdraw</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  balanceCards: {
    paddingHorizontal: theme.spacing.lg,
  },
  mainBalanceCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary[600],
    marginBottom: theme.spacing.md,
  },
  balanceLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.sm,
  },
  currency: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    opacity: 0.75,
    marginTop: theme.spacing.xs,
  },
  smallCardsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  smallCard: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  smallCardLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  smallCardAmount: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  depositButton: {
    backgroundColor: theme.colors.primary[600],
  },
  withdrawButton: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
  withdrawButtonText: {
    color: theme.colors.primary[600],
  },
  transactionsSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  txIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  txDescription: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  txDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  txAmountContainer: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  txBalance: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  currencyPrefix: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
  amountInput: {
    flex: 1,
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.sm,
  },
  paymentMethodActive: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  paymentMethodText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  paymentMethodTextActive: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  modalButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[600],
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
});

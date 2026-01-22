import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Lock,
  DollarSign,
  CreditCard,
  Smartphone,
  History,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { walletService } from "../services/walletService";
import { paymentService } from "../services/paymentService";
import type { WalletBalance, Transaction, PaymentMethodType } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicStatCard,
} from "../components/neumorphic";

const PAYMENT_METHODS = [
  {
    id: "ecocash",
    name: "EcoCash",
    icon: Smartphone,
    description: "📱 You will be redirected to EcoCash to complete payment",
  },
  {
    id: "onemoney",
    name: "OneMoney",
    icon: Smartphone,
    description: "📱 You will be redirected to OneMoney to complete payment",
  },
  {
    id: "telecash",
    name: "Telecash",
    icon: Smartphone,
    description: "📱 You will be redirected to Telecash to complete payment",
  },
  {
    id: "zipit",
    name: "ZIPIT",
    icon: CreditCard,
    description: "🏦 You will receive bank transfer instructions",
  },
  {
    id: "usd_bank",
    name: "USD Bank Transfer",
    icon: CreditCard,
    description: "🏦 You will receive bank account details for USD transfer",
  },
  {
    id: "card",
    name: "Debit/Credit Card",
    icon: CreditCard,
    description: "💳 You will be redirected to secure card payment page",
  },
];

export default function WalletScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ payment?: string }>();

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodType>("ecocash");
  const [accountDetails, setAccountDetails] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWalletData();

    // Check for payment success/failure from URL params
    const paymentStatus = searchParams.payment;
    if (paymentStatus === "success") {
      Alert.alert("Success", "✅ Payment completed successfully!");
      // Reload wallet to show updated balance
      setTimeout(() => loadWalletData(), 1000);
    } else if (paymentStatus === "failed") {
      Alert.alert("Failed", "❌ Payment failed. Please try again.");
    } else if (paymentStatus === "cancelled") {
      Alert.alert("Cancelled", "⚠️ Payment was cancelled.");
    }
  }, [searchParams.payment]);

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
    const amount = parseFloat(depositAmount);

    // Validation
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (amount < 1) {
      Alert.alert("Error", "Minimum deposit amount is $1");
      return;
    }

    if (amount > 10000) {
      Alert.alert("Error", "Maximum deposit amount is $10,000 per transaction");
      return;
    }

    try {
      setProcessing(true);

      // Initiate payment via gateway
      const response = await paymentService.initiateDeposit({
        amount,
        paymentMethod: paymentMethod as PaymentMethodType,
      });

      if (response.success) {
        const { paymentUrl, isMockPayment, paymentId, instructions } =
          response.data;

        // Close modal
        setShowDepositModal(false);
        setDepositAmount("");

        if (isMockPayment && paymentId) {
          // Navigate to mock payment screen
          router.push({
            pathname: "/payment/[paymentId]",
            params: { paymentId },
          });
        } else if (paymentUrl) {
          // Open external payment gateway (Paynow)
          const canOpen = await Linking.canOpenURL(paymentUrl);
          if (canOpen) {
            await Linking.openURL(paymentUrl);
          } else {
            Alert.alert("Error", "Cannot open payment page. Please try again.");
          }
        } else if (instructions) {
          // Manual payment (ZIPIT/Bank Transfer)
          showManualPaymentInstructions(response.data);
        }
      }
    } catch (error: any) {
      console.error("Deposit initiation failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to initiate payment",
      );
    } finally {
      setProcessing(false);
    }
  };

  const showManualPaymentInstructions = (paymentData: any) => {
    Alert.alert(
      "Payment Instructions",
      `${paymentData.instructions}\n\nReference: ${paymentData.reference}\n\nPlease complete the payment and it will be credited within 24 hours.`,
      [{ text: "OK" }],
    );
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
        accountDetails,
      );
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setAccountDetails("");
      loadWalletData();
      Alert.alert("Success", "Withdrawal request submitted!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Withdrawal failed",
      );
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return {
          icon: ArrowDownCircle,
          color: neumorphicColors.semantic.success,
        };
      case "payment":
        return { icon: DollarSign, color: neumorphicColors.semantic.success };
      case "withdrawal":
        return { icon: ArrowUpCircle, color: neumorphicColors.semantic.error };
      case "escrow_hold":
        return { icon: Lock, color: neumorphicColors.semantic.warning };
      case "escrow_release":
        return { icon: Lock, color: neumorphicColors.semantic.info };
      default:
        return { icon: DollarSign, color: neumorphicColors.text.secondary };
    }
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="dashboard" showLeaves={true}>
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
        {/* Header */}
        <View style={styles.header}>
          <Wallet size={28} color={neumorphicColors.primary[600]} />
          <Text style={styles.title}>My Wallet</Text>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceCards}>
          <NeumorphicCard variant="elevated" style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              ${balance?.balance.toLocaleString() || "0.00"}
            </Text>
            <Text style={styles.currency}>{balance?.currency || "USD"}</Text>
          </NeumorphicCard>

          <View style={styles.smallCardsRow}>
            <NeumorphicStatCard
              title="In Escrow"
              value={`$${balance?.escrowBalance.toLocaleString() || "0"}`}
              icon={<Lock size={20} color={neumorphicColors.secondary[600]} />}
              trend="neutral"
              style={styles.smallCard}
            />

            <NeumorphicStatCard
              title="Available"
              value={`$${balance?.availableBalance.toLocaleString() || "0"}`}
              icon={
                <DollarSign size={20} color={neumorphicColors.semantic.info} />
              }
              trend="up"
              style={styles.smallCard}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <NeumorphicButton
            title="Deposit"
            variant="primary"
            icon={
              <ArrowDownCircle
                size={20}
                color={neumorphicColors.text.inverse}
              />
            }
            onPress={() => setShowDepositModal(true)}
            style={styles.actionButton}
          />

          <NeumorphicButton
            title="Withdraw"
            variant="secondary"
            icon={
              <ArrowUpCircle size={20} color={neumorphicColors.primary[600]} />
            }
            onPress={() => setShowWithdrawModal(true)}
            style={styles.actionButton}
          />
        </View>

        {/* Payment History Button */}
        <View style={styles.paymentHistoryContainer}>
          <NeumorphicButton
            title="📜 Payment History"
            variant="tertiary"
            icon={<History size={20} color={neumorphicColors.text.secondary} />}
            onPress={() => router.push("/payment-history")}
            style={styles.paymentHistoryButton}
          />
        </View>

        {/* Locked Wallet Warning */}
        {balance?.isLocked && (
          <View style={styles.lockedWarning}>
            <Lock size={24} color={neumorphicColors.semantic.error} />
            <View style={styles.lockedTextContainer}>
              <Text style={styles.lockedTitle}>🔒 Wallet Locked</Text>
              <Text style={styles.lockedText}>
                Your wallet has been locked. Please contact support for
                assistance.
              </Text>
            </View>
          </View>
        )}

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Clock size={48} color={neumorphicColors.text.tertiary} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>Deposit funds to get started</Text>
            </View>
          ) : (
            transactions.map((tx, index) => {
              const { icon: Icon, color } = getTransactionIcon(tx.type);
              const isPositive = [
                "deposit",
                "payment",
                "escrow_release",
              ].includes(tx.type);

              return (
                <NeumorphicCard
                  key={tx.id}
                  style={styles.transactionCard}
                  variant="standard"
                  animationDelay={index * 50}
                >
                  <View style={styles.txContent}>
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
                              ? neumorphicColors.semantic.success
                              : neumorphicColors.semantic.error,
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
                  </View>
                </NeumorphicCard>
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
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Deposit Funds</Text>

              <Text style={styles.inputLabel}>Amount (USD) *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={neumorphicColors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  editable={!processing}
                />
              </View>
              <Text style={styles.amountHint}>
                Minimum: $1 | Maximum: $10,000 per transaction
              </Text>

              <Text style={styles.inputLabel}>Payment Method *</Text>
              <View style={styles.paymentMethods}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      paymentMethod === method.id && styles.paymentMethodActive,
                    ]}
                    onPress={() =>
                      setPaymentMethod(method.id as PaymentMethodType)
                    }
                    disabled={processing}
                  >
                    <method.icon
                      size={20}
                      color={
                        paymentMethod === method.id
                          ? neumorphicColors.primary[600]
                          : neumorphicColors.text.secondary
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

              {/* Payment Method Info */}
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodInfoText}>
                  {
                    PAYMENT_METHODS.find((m) => m.id === paymentMethod)
                      ?.description
                  }
                </Text>
              </View>

              {/* Development Mode Warning */}
              <View style={styles.devWarning}>
                <Text style={styles.devWarningText}>
                  ℹ️{" "}
                  <Text style={styles.devWarningBold}>Development Mode:</Text>{" "}
                  This is currently using a mock payment gateway. Real payment
                  processing will be enabled once Paynow integration is
                  activated.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <NeumorphicButton
                  title="Cancel"
                  variant="tertiary"
                  onPress={() => setShowDepositModal(false)}
                  style={styles.modalButton}
                  disabled={processing}
                />
                <NeumorphicButton
                  title={
                    processing
                      ? "Processing..."
                      : `Deposit $${depositAmount || "0"}`
                  }
                  variant="primary"
                  onPress={handleDeposit}
                  loading={processing}
                  style={styles.modalButton}
                  disabled={
                    processing ||
                    !depositAmount ||
                    parseFloat(depositAmount) < 1
                  }
                />
              </View>
            </View>
          </ScrollView>
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
                placeholderTextColor={neumorphicColors.text.tertiary}
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
                        ? neumorphicColors.primary[600]
                        : neumorphicColors.text.secondary
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
              placeholderTextColor={neumorphicColors.text.tertiary}
              value={accountDetails}
              onChangeText={setAccountDetails}
            />

            <View style={styles.modalButtons}>
              <NeumorphicButton
                title="Cancel"
                variant="tertiary"
                onPress={() => setShowWithdrawModal(false)}
                style={styles.modalButton}
              />
              <NeumorphicButton
                title="Withdraw"
                variant="primary"
                onPress={handleWithdraw}
                loading={processing}
                style={styles.modalButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  balanceCards: {
    paddingHorizontal: spacing.lg,
  },
  mainBalanceCard: {
    padding: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: neumorphicColors.primary[600],
  },
  balanceLabel: {
    ...typography.body,
    color: neumorphicColors.text.inverse,
    opacity: 0.9,
  },
  balanceAmount: {
    ...typography.h1,
    color: neumorphicColors.text.inverse,
    marginTop: spacing.sm,
  },
  currency: {
    ...typography.caption,
    color: neumorphicColors.text.inverse,
    opacity: 0.75,
    marginTop: spacing.xs,
  },
  smallCardsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  smallCard: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  transactionsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
  },
  transactionCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  txContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  txIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  txDescription: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.primary,
  },
  txDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
  txAmountContainer: {
    alignItems: "flex-end",
  },
  txAmount: {
    ...typography.h5,
  },
  txBalance: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
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
    maxHeight: "80%",
  },
  modalTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  inputLabel: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    ...typography.h3,
    color: neumorphicColors.text.secondary,
  },
  amountInput: {
    flex: 1,
    ...typography.h3,
    color: neumorphicColors.text.primary,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  textInput: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
    gap: spacing.sm,
  },
  paymentMethodActive: {
    borderColor: neumorphicColors.primary[600],
    backgroundColor: `${neumorphicColors.primary[500]}15`,
  },
  paymentMethodText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  paymentMethodTextActive: {
    color: neumorphicColors.primary[600],
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
  modalScrollView: {
    maxHeight: "90%",
  },
  amountHint: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
  paymentMethodInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.primary[200],
  },
  paymentMethodInfoText: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[700],
  },
  devWarning: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: neumorphicColors.semantic.warning + "15",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.semantic.warning + "30",
  },
  devWarningText: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  devWarningBold: {
    fontWeight: "700",
    color: neumorphicColors.semantic.warning,
  },
  paymentHistoryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  paymentHistoryButton: {
    width: "100%",
  },
  lockedWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: neumorphicColors.semantic.error + "15",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.semantic.error + "30",
    gap: spacing.md,
  },
  lockedTextContainer: {
    flex: 1,
  },
  lockedTitle: {
    ...typography.bodyMedium,
    fontWeight: "700",
    color: neumorphicColors.semantic.error,
    marginBottom: spacing.xs,
  },
  lockedText: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
});

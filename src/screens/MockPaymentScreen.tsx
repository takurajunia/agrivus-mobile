import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { paymentService } from "../services/paymentService";
import type { PaymentStatus } from "../types";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
} from "../components/neumorphic";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MockPaymentScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentId]);

  useEffect(() => {
    if (processing && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (processing && countdown === 0) {
      // Auto-complete mock payment
      handleComplete();
    }
  }, [processing, countdown]);

  const loadPaymentDetails = async () => {
    if (!paymentId) {
      Alert.alert("Error", "No payment ID provided");
      router.back();
      return;
    }

    try {
      setLoading(true);
      const response = await paymentService.checkStatus(paymentId);
      setPayment(response.data);
    } catch (error) {
      console.error("Failed to load payment:", error);
      Alert.alert("Error", "Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setProcessing(true);
  };

  const handleComplete = async () => {
    try {
      // In mock mode, payment auto-completes after 5 seconds
      // Poll until completed
      await paymentService.pollPaymentStatus(paymentId!, (status) => {
        console.log("Payment status:", status);
      });

      setPaymentComplete(true);
      setProcessing(false);

      // Navigate back to wallet after showing success
      setTimeout(() => {
        router.replace({
          pathname: "/(tabs)/wallet",
          params: { payment: "success" },
        });
      }, 2000);
    } catch (error: any) {
      console.error("Payment failed:", error);
      setPaymentFailed(true);
      setProcessing(false);

      setTimeout(() => {
        router.replace({
          pathname: "/(tabs)/wallet",
          params: { payment: "failed" },
        });
      }, 2000);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Payment",
      "Are you sure you want to cancel this payment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            router.replace({
              pathname: "/(tabs)/wallet",
              params: { payment: "cancelled" },
            });
          },
        },
      ],
    );
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

  // Processing state
  if (processing) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.processingCard}>
            <ActivityIndicator
              size="large"
              color={neumorphicColors.primary[600]}
            />
            <Text style={styles.processingTitle}>Processing Payment...</Text>
            <Text style={styles.processingSubtitle}>
              Simulating {payment?.paymentMethod?.toUpperCase() || "PAYMENT"}{" "}
              gateway
            </Text>

            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                Payment will complete in {countdown} seconds
              </Text>
              <Text style={styles.countdownNote}>
                In production, you would complete this on the actual payment
                gateway
              </Text>
            </View>
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  // Payment complete state
  if (paymentComplete) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.resultCard}>
            <View style={styles.successIconContainer}>
              <CheckCircle
                size={64}
                color={neumorphicColors.semantic.success}
              />
            </View>
            <Text style={styles.resultTitle}>Payment Successful!</Text>
            <Text style={styles.resultSubtitle}>
              Your wallet has been credited with $
              {payment?.amount?.toFixed(2) || "0.00"}
            </Text>
            <Text style={styles.redirectText}>Redirecting to wallet...</Text>
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  // Payment failed state
  if (paymentFailed) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.resultCard}>
            <View style={styles.failedIconContainer}>
              <XCircle size={64} color={neumorphicColors.semantic.error} />
            </View>
            <Text style={styles.resultTitle}>Payment Failed</Text>
            <Text style={styles.resultSubtitle}>
              Something went wrong. Please try again.
            </Text>
            <Text style={styles.redirectText}>Redirecting to wallet...</Text>
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="dashboard">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <CreditCard size={40} color={neumorphicColors.primary[600]} />
          </View>
          <Text style={styles.title}>Mock Payment Gateway</Text>
          <Text style={styles.subtitle}>
            Development Mode - Simulating{" "}
            {payment?.paymentMethod?.toUpperCase() || "PAYMENT"}
          </Text>
        </View>

        {/* Payment Details Card */}
        <NeumorphicCard variant="elevated" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              ${payment?.amount?.toFixed(2) || "0.00"} USD
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference:</Text>
            <Text style={styles.referenceValue}>
              {payment?.reference || "N/A"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method:</Text>
            <Text style={styles.detailValue}>
              {paymentService.formatPaymentMethod(payment?.paymentMethod || "")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Clock size={14} color={neumorphicColors.semantic.warning} />
              <Text style={styles.statusText}>
                {payment?.status?.toUpperCase() || "PENDING"}
              </Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Instructions Card */}
        <NeumorphicCard variant="standard" style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>
            🧪 Mock Payment Instructions:
          </Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              1. This is a simulated payment for testing
            </Text>
            <Text style={styles.instructionItem}>
              2. Tap "Approve Payment" to simulate successful payment
            </Text>
            <Text style={styles.instructionItem}>
              3. Payment will auto-complete after 5 seconds
            </Text>
            <Text style={styles.instructionItem}>
              4. Your wallet will be credited automatically
            </Text>
          </View>
        </NeumorphicCard>

        {/* Warning Card */}
        <NeumorphicCard variant="bordered" style={styles.warningCard}>
          <View style={styles.warningContent}>
            <Shield size={24} color={neumorphicColors.semantic.warning} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>⚠️ Development Mode</Text>
              <Text style={styles.warningText}>
                This is a mock payment gateway. In production, you'll be
                redirected to the actual{" "}
                {paymentService.formatPaymentMethod(
                  payment?.paymentMethod || "",
                )}{" "}
                payment page.
              </Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <NeumorphicButton
            title="✓ Approve Payment"
            variant="primary"
            onPress={handleApprove}
            style={styles.approveButton}
          />
          <NeumorphicButton
            title="✕ Cancel"
            variant="tertiary"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            When using Paynow in production, you'll be redirected to their
            secure payment page where you can pay using EcoCash, OneMoney,
            Telecash, ZIPIT, or card.
          </Text>
        </View>
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // Details Card
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.pressed,
  },
  detailLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  detailValue: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  referenceValue: {
    ...typography.caption,
    fontFamily: "monospace",
    color: neumorphicColors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: neumorphicColors.semantic.warning + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    color: neumorphicColors.semantic.warning,
  },

  // Instructions Card
  instructionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: neumorphicColors.primary[50],
  },
  instructionsTitle: {
    ...typography.h5,
    color: neumorphicColors.primary[700],
    marginBottom: spacing.md,
  },
  instructionsList: {
    gap: spacing.xs,
  },
  instructionItem: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[600],
    lineHeight: 20,
  },

  // Warning Card
  warningCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: neumorphicColors.semantic.warning + "15",
    borderWidth: 1,
    borderColor: neumorphicColors.semantic.warning + "30",
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.semantic.warning,
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    lineHeight: 18,
  },

  // Action Buttons
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  approveButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },

  // Footer
  footerNote: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  footerText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    lineHeight: 16,
  },

  // Processing State
  processingCard: {
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
  },
  processingTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  processingSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  countdownContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.primary[200],
    width: "100%",
  },
  countdownText: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.primary[700],
    textAlign: "center",
  },
  countdownNote: {
    ...typography.caption,
    color: neumorphicColors.primary[500],
    textAlign: "center",
    marginTop: spacing.sm,
  },

  // Result States
  resultCard: {
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: neumorphicColors.semantic.success + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  failedIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: neumorphicColors.semantic.error + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  resultTitle: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  redirectText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
  },
});

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  AppState,
  type AppStateStatus,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, XCircle, Clock } from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { paymentService, PAYMENT_METHODS } from "../services/paymentService";
import type { PaymentStatus } from "../services/paymentService";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
} from "../components/neumorphic";
import LoadingSpinner from "../components/LoadingSpinner";

type Stage =
  | "loading"
  | "cash"
  | "instructions"
  | "polling"
  | "success"
  | "failed"
  | "cancelled";

type RouteParams = {
  paymentId: string;
  reference?: string;
  amount?: string;
  paymentMethod?: string;
  paymentUrl?: string;
  instructions?: string;
  isMockPayment?: string;
};

export default function PaymentScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const router = useRouter();
  const paymentId = params.paymentId;

  const [stage, setStage] = useState<Stage>("loading");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);

  // Mock-mode countdown state
  const [mockApproving, setMockApproving] = useState(false);
  const [mockCountdown, setMockCountdown] = useState(5);

  const hasOpenedBrowser = useRef(false);
  const hasAutoPolledOnResume = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!paymentId) {
      router.replace("/(tabs)/wallet");
      return;
    }

    // If WalletScreen already handed us the full deposit-initiation payload
    // via route params, use it directly — no need to re-fetch.
    if (params.paymentMethod && params.amount) {
      const initial: PaymentStatus = {
        paymentId,
        reference: params.reference || "",
        status: "pending",
        paid: false,
        amount: Number.parseFloat(params.amount) || 0,
        paymentMethod: params.paymentMethod,
        instructions: params.instructions || undefined,
        paymentUrl: params.paymentUrl || undefined,
      };
      setPayment(initial);
      setIsMock(params.isMockPayment === "true");
      routeToStage(initial, params.isMockPayment === "true");
      return;
    }

    // Otherwise (e.g. opened via a deep link with only a paymentId), fetch it.
    loadPayment(paymentId);
  }, [paymentId]);

  const routeToStage = (data: PaymentStatus, mock: boolean) => {
    if (data.status === "completed") {
      setStage("success");
      return;
    }
    if (data.status === "failed") {
      setStage("failed");
      return;
    }
    if (data.status === "cancelled") {
      setStage("cancelled");
      return;
    }
    if (data.paymentMethod === "cash") {
      setStage("cash");
      return;
    }
    setStage("instructions");
    if (data.paymentUrl && !mock && !hasOpenedBrowser.current) {
      hasOpenedBrowser.current = true;
      Linking.openURL(data.paymentUrl).catch(() => {
        Alert.alert("Error", "Could not open the payment page. Please try again.");
      });
    }
  };

  const loadPayment = async (id: string) => {
    try {
      const res = await paymentService.checkStatus(id);
      setPayment(res.data);
      routeToStage(res.data, false);
    } catch {
      setError(
        "Failed to load payment details. Please check your payment history.",
      );
      setStage("failed");
    }
  };

  const startPolling = useCallback(() => {
    if (!paymentId) return;
    setStage("polling");
    paymentService
      .pollPaymentStatus(
        paymentId,
        (status) => {
          setPayment(status);
          setPollCount((c) => c + 1);
        },
        72, // 72 x 5s = 6 minutes
      )
      .then(() => setStage("success"))
      .catch((err: Error) => {
        if (err.message.includes("timeout")) {
          setError(
            "Payment is taking longer than expected. Check your payment history for updates.",
          );
        } else {
          setError(err.message);
        }
        setStage("failed");
      });
  }, [paymentId]);

  // Auto-poll when the app returns to the foreground after the user
  // completed a browser-based (paymentUrl) checkout.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const cameToForeground =
          appState.current.match(/inactive|background/) &&
          nextState === "active";
        appState.current = nextState;

        if (
          cameToForeground &&
          stage === "instructions" &&
          hasOpenedBrowser.current &&
          !hasAutoPolledOnResume.current
        ) {
          hasAutoPolledOnResume.current = true;
          startPolling();
        }
      },
    );

    return () => subscription.remove();
  }, [stage, startPolling]);

  // Mock-mode countdown → auto-complete
  useEffect(() => {
    if (!mockApproving) return;
    if (mockCountdown > 0) {
      const timer = setTimeout(() => setMockCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    startPolling();
  }, [mockApproving, mockCountdown, startPolling]);

  const handleCancel = () => {
    router.replace({
      pathname: "/(tabs)/wallet",
      params: { payment: "cancelled" },
    });
  };

  const methodInfo = PAYMENT_METHODS.find(
    (m) => m.id === payment?.paymentMethod,
  );

  // ── Loading ────────────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  // ── Cash deposit (no gateway) ─────────────────────────────────────────
  if (stage === "cash") {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.resultCard}>
            <View style={styles.successIconContainer}>
              <Text style={styles.bigEmoji}>💵</Text>
            </View>
            <Text style={styles.resultTitle}>Cash Deposit Submitted</Text>
            <Text style={styles.resultSubtitle}>
              Your deposit of ${payment?.amount?.toFixed(2) || "0.00"} is
              pending admin verification.
            </Text>
            <NeumorphicCard variant="standard" style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>What happens next:</Text>
              <Text style={styles.instructionItem}>
                1. An admin will verify your cash deposit
              </Text>
              <Text style={styles.instructionItem}>
                2. You'll receive a notification once verified
              </Text>
              <Text style={styles.instructionItem}>
                3. Funds will appear in your wallet immediately after
              </Text>
            </NeumorphicCard>
            <Text style={styles.referenceValue}>
              Reference: {payment?.reference || "N/A"}
            </Text>
            <NeumorphicButton
              title="Return to Wallet"
              variant="primary"
              onPress={() => router.replace("/(tabs)/wallet")}
              style={styles.fullWidthButton}
            />
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (stage === "success") {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.resultCard}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={64} color={neumorphicColors.semantic.success} />
            </View>
            <Text style={styles.resultTitle}>Payment Successful!</Text>
            <Text style={styles.resultSubtitle}>
              ${payment?.amount?.toFixed(2) || "0.00"} has been added to your
              wallet.
            </Text>
            <Text style={styles.referenceValue}>
              Reference: {payment?.reference || "N/A"}
            </Text>
            <NeumorphicButton
              title="Go to Wallet"
              variant="primary"
              onPress={() =>
                router.replace({
                  pathname: "/(tabs)/wallet",
                  params: { payment: "success" },
                })
              }
              style={styles.fullWidthButton}
            />
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  // ── Failed / cancelled ────────────────────────────────────────────────
  if (stage === "failed" || stage === "cancelled") {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.resultCard}>
            <View style={styles.failedIconContainer}>
              <XCircle size={64} color={neumorphicColors.semantic.error} />
            </View>
            <Text style={styles.resultTitle}>
              {stage === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
            </Text>
            <Text style={styles.resultSubtitle}>
              {error || "Your payment could not be processed."}
            </Text>
            <View style={styles.actionButtons}>
              <NeumorphicButton
                title="Back to Wallet"
                variant="tertiary"
                onPress={() =>
                  router.replace({
                    pathname: "/(tabs)/wallet",
                    params: { payment: stage },
                  })
                }
                style={styles.halfButton}
              />
              <NeumorphicButton
                title="Try Again"
                variant="primary"
                onPress={() =>
                  router.replace({
                    pathname: "/(tabs)/wallet",
                    params: { action: "deposit" },
                  })
                }
                style={styles.halfButton}
              />
            </View>
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  // ── Polling ────────────────────────────────────────────────────────────
  if (stage === "polling") {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.centerContainer}>
          <NeumorphicCard variant="elevated" style={styles.processingCard}>
            <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
            <Text style={styles.processingTitle}>Confirming Payment…</Text>
            <Text style={styles.processingSubtitle}>
              {isMock
                ? "Simulating payment confirmation…"
                : "Waiting for confirmation from your mobile wallet."}
            </Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                Checked {pollCount} time{pollCount !== 1 ? "s" : ""}…
              </Text>
            </View>
          </NeumorphicCard>
        </View>
      </NeumorphicScreen>
    );
  }

  // ── Instructions (mobile money / browser checkout / mock) ────────────
  return (
    <NeumorphicScreen variant="dashboard">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.bigEmoji}>{methodInfo?.icon || "💳"}</Text>
          </View>
          <Text style={styles.title}>
            {methodInfo?.label || "Complete Payment"}
          </Text>
          <Text style={styles.subtitle}>
            Follow the steps below to complete your payment
          </Text>
        </View>

        <NeumorphicCard variant="elevated" style={styles.detailsCard}>
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
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Clock size={14} color={neumorphicColors.semantic.warning} />
              <Text style={styles.statusText}>PENDING</Text>
            </View>
          </View>
        </NeumorphicCard>

        {payment?.paymentUrl && !mockApproving && (
          <NeumorphicCard variant="standard" style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>
              We opened your browser to complete this payment
            </Text>
            <Text style={styles.instructionItem}>
              Finish the payment there, then come back to this app — we'll
              confirm it automatically, or tap the button below.
            </Text>
          </NeumorphicCard>
        )}

        {payment?.instructions && !mockApproving && (
          <NeumorphicCard variant="standard" style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>
              {methodInfo?.requiresPhone
                ? "A payment prompt has been sent to your phone"
                : "Instructions"}
            </Text>
            <Text style={styles.instructionItem}>{payment.instructions}</Text>
          </NeumorphicCard>
        )}

        {isMock && !mockApproving && (
          <NeumorphicCard variant="bordered" style={styles.mockCard}>
            <Text style={styles.mockText}>
              🔧 Development mode: tap "I've Paid" to simulate a completed
              payment
            </Text>
          </NeumorphicCard>
        )}

        {mockApproving ? (
          <NeumorphicCard variant="elevated" style={styles.processingCard}>
            <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
            <Text style={styles.processingTitle}>Processing Payment...</Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                Payment will complete in {mockCountdown} seconds
              </Text>
            </View>
          </NeumorphicCard>
        ) : (
          <View style={styles.actionButtons}>
            <NeumorphicButton
              title={isMock ? "✓ Approve Payment" : "I've Paid — Check Status"}
              variant="primary"
              onPress={() =>
                isMock ? setMockApproving(true) : startPolling()
              }
              style={styles.fullWidthButton}
            />
            <NeumorphicButton
              title="Cancel"
              variant="tertiary"
              onPress={handleCancel}
              style={styles.fullWidthButton}
            />
          </View>
        )}

        <Text style={styles.footerText}>
          Status will update automatically once your payment is confirmed
        </Text>
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  header: { alignItems: "center", marginBottom: spacing.xl },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  bigEmoji: { fontSize: 36 },
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

  detailsCard: { padding: spacing.lg, marginBottom: spacing.lg },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.pressed,
  },
  detailLabel: { ...typography.body, color: neumorphicColors.text.secondary },
  detailValue: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  referenceValue: {
    ...typography.caption,
    fontFamily: "monospace",
    color: neumorphicColors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
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

  instructionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: neumorphicColors.primary[50],
  },
  instructionsTitle: {
    ...typography.h5,
    color: neumorphicColors.primary[700],
    marginBottom: spacing.sm,
  },
  instructionItem: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[600],
    lineHeight: 20,
    marginBottom: spacing.xs,
  },

  mockCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: neumorphicColors.semantic.warning + "15",
    borderWidth: 1,
    borderColor: neumorphicColors.semantic.warning + "30",
  },
  mockText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.warning,
  },

  actionButtons: { gap: spacing.md, marginBottom: spacing.lg },
  fullWidthButton: { width: "100%", marginTop: spacing.md },
  halfButton: { flex: 1 },

  footerText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
  },

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
    width: "100%",
  },
  countdownText: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.primary[700],
    textAlign: "center",
  },

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
    marginBottom: spacing.md,
  },
});

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
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Trophy,
  Package,
  Clock,
  MapPin,
  Truck,
  User,
  Phone,
  DollarSign,
  CheckCircle,
  Star,
  AlertCircle,
} from "lucide-react-native";
import AnimatedCard from "../../../src/components/AnimatedCard";
import AnimatedButton from "../../../src/components/AnimatedButton";
import GlassCard from "../../../src/components/GlassCard";
import ModernInput from "../../../src/components/ModernInput";
import { theme } from "../../../src/theme/tokens";
import { auctionsService } from "../../../src/services/auctionsService";
import api from "../../../src/services/api";
import { useAuth } from "../../../src/contexts/AuthContext";

interface Transporter {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehicleCapacity: string;
  baseRate: string;
  platformScore: number;
  totalTransactions: number;
  estimatedCost?: number;
  estimatedDistance?: number;
}

export default function AuctionCheckoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    deliveryLocation: "",
    notes: "",
    usesTransport: true,
    transporterId: "",
    transportCost: 0,
  });

  const fetchAuctionDetails = useCallback(
    async (refresh = false) => {
      if (!id) return;

      try {
        if (refresh) {
          setRefreshing(true);
        }
        setError("");

        const response = await auctionsService.getAuctionDetails(id);

        if (response.success || response.data) {
          const data = response.data;
          setAuction(data.auction || data);
          setListing(data.listing || data.listing);

          // Verify user is the winner
          const auctionData = data.auction || data;
          if (auctionData.winnerId !== user?.id) {
            setError("You are not the winner of this auction");
            return;
          }

          // Check if already completed
          if (auctionData.orderId) {
            Alert.alert(
              "Order Created",
              "This auction has already been checked out"
            );
            router.replace("/orders" as any);
            return;
          }

          // Fetch available transporters
          const location = (data.listing || data).location;
          if (location) {
            await fetchTransporters(location);
          }
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load auction details"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, user?.id, router]
  );

  const fetchTransporters = async (location: string) => {
    try {
      const response = await api.get("/orders/transporters", {
        params: { location },
      });

      if (response.data.success) {
        setTransporters(response.data.data || []);
        if (response.data.data?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            transporterId: response.data.data[0].id,
            transportCost: response.data.data[0].estimatedCost || 0,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch transporters:", err);
    }
  };

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  const handleRefresh = useCallback(() => {
    fetchAuctionDetails(true);
  }, [fetchAuctionDetails]);

  const handleTransporterSelect = (transporter: Transporter) => {
    setFormData((prev) => ({
      ...prev,
      transporterId: transporter.id,
      transportCost: transporter.estimatedCost || 0,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    // Validate delivery location only if using transport
    if (formData.usesTransport && !formData.deliveryLocation.trim()) {
      setError("Please enter delivery location");
      return;
    }

    if (formData.usesTransport && !formData.transporterId) {
      setError("Please select a transporter");
      return;
    }

    try {
      setSubmitting(true);

      const response = await auctionsService.chooseTransport(id!, formData);

      if (response.success) {
        Alert.alert(
          "Success! 🎉",
          "Your order has been created successfully! The transporter will be in contact shortly.",
          [
            {
              text: "View Orders",
              onPress: () => router.replace("/orders" as any),
            },
          ]
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to complete checkout"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `$${num.toLocaleString()}`;
  };

  const deadline = auction?.transportChoiceDeadline
    ? new Date(auction.transportChoiceDeadline)
    : null;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !auction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Auction Checkout</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={theme.colors.error} strokeWidth={1} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <AnimatedButton
            title="View Auction"
            variant="primary"
            size="md"
            style={{ marginTop: theme.spacing.lg }}
            onPress={() => router.push(`/auction/${id}` as any)}
          />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>Complete Purchase</Text>
        <View style={styles.placeholder} />
      </View>

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
        {/* Winner Banner */}
        <GlassCard style={styles.winnerBanner}>
          <View style={styles.bannerContent}>
            <Trophy size={40} color={theme.colors.warning} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                🎉 Congratulations! You Won!
              </Text>
              <Text style={styles.bannerSubtitle}>
                Your winning bid of{" "}
                {formatCurrency(auction?.finalPrice || auction?.currentPrice)}{" "}
                is held securely in escrow.
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Deadline Warning */}
        {daysLeft > 0 && daysLeft <= 7 && (
          <View style={styles.deadlineWarning}>
            <Clock size={20} color={theme.colors.warning} />
            <Text style={styles.deadlineText}>
              ⏰ {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining to complete
              checkout
            </Text>
          </View>
        )}

        {/* Product Summary */}
        <Text style={styles.sectionTitle}>Auction Item</Text>
        <AnimatedCard style={styles.productCard}>
          <View style={styles.productInfo}>
            <Package size={40} color={theme.colors.primary[600]} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>
                {listing?.cropType ||
                  auction?.listing?.cropType ||
                  "Agricultural Product"}
              </Text>
              <Text style={styles.productQuantity}>
                {listing?.quantity || auction?.listing?.quantity}{" "}
                {listing?.unit || auction?.listing?.unit || "kg"}
              </Text>
              {listing?.location && (
                <View style={styles.locationRow}>
                  <MapPin size={14} color={theme.colors.text.tertiary} />
                  <Text style={styles.locationText}>{listing.location}</Text>
                </View>
              )}
            </View>
          </View>
        </AnimatedCard>

        {/* Delivery Options */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <AnimatedCard style={styles.deliveryCard}>
          <TouchableOpacity
            style={[
              styles.deliveryOption,
              formData.usesTransport && styles.deliveryOptionSelected,
            ]}
            onPress={() =>
              setFormData((prev) => ({ ...prev, usesTransport: true }))
            }
          >
            <Truck
              size={24}
              color={
                formData.usesTransport
                  ? theme.colors.primary[600]
                  : theme.colors.text.tertiary
              }
            />
            <View style={styles.deliveryOptionText}>
              <Text
                style={[
                  styles.deliveryOptionTitle,
                  formData.usesTransport && styles.deliveryOptionTitleSelected,
                ]}
              >
                Delivery to Location
              </Text>
              <Text style={styles.deliveryOptionSubtitle}>
                A transporter will deliver to your address
              </Text>
            </View>
            {formData.usesTransport && (
              <CheckCircle size={20} color={theme.colors.primary[600]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deliveryOption,
              !formData.usesTransport && styles.deliveryOptionSelected,
            ]}
            onPress={() =>
              setFormData((prev) => ({ ...prev, usesTransport: false }))
            }
          >
            <MapPin
              size={24}
              color={
                !formData.usesTransport
                  ? theme.colors.primary[600]
                  : theme.colors.text.tertiary
              }
            />
            <View style={styles.deliveryOptionText}>
              <Text
                style={[
                  styles.deliveryOptionTitle,
                  !formData.usesTransport && styles.deliveryOptionTitleSelected,
                ]}
              >
                Self Pickup
              </Text>
              <Text style={styles.deliveryOptionSubtitle}>
                Pick up from seller's location
              </Text>
            </View>
            {!formData.usesTransport && (
              <CheckCircle size={20} color={theme.colors.primary[600]} />
            )}
          </TouchableOpacity>
        </AnimatedCard>

        {/* Delivery Location */}
        {formData.usesTransport && (
          <>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <AnimatedCard style={styles.inputCard}>
              <ModernInput
                label="Enter your delivery location"
                placeholder="123 Farm Road, Agricultural District"
                value={formData.deliveryLocation}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, deliveryLocation: text }))
                }
                icon={<MapPin size={20} color={theme.colors.text.tertiary} />}
              />
            </AnimatedCard>
          </>
        )}

        {/* Transporters */}
        {formData.usesTransport && transporters.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Select Transporter</Text>
            {transporters.map((transporter) => (
              <AnimatedCard
                key={transporter.id}
                style={[
                  styles.transporterCard,
                  formData.transporterId === transporter.id &&
                    styles.transporterCardSelected,
                ]}
                onPress={() => handleTransporterSelect(transporter)}
              >
                <View style={styles.transporterHeader}>
                  <View style={styles.transporterAvatar}>
                    <Truck size={24} color={theme.colors.primary[600]} />
                  </View>
                  <View style={styles.transporterInfo}>
                    <Text style={styles.transporterName}>
                      {transporter.fullName}
                    </Text>
                    <View style={styles.transporterMeta}>
                      <Text style={styles.transporterVehicle}>
                        {transporter.vehicleType} •{" "}
                        {transporter.vehicleCapacity}
                      </Text>
                    </View>
                  </View>
                  {formData.transporterId === transporter.id && (
                    <CheckCircle size={24} color={theme.colors.primary[600]} />
                  )}
                </View>

                <View style={styles.transporterStats}>
                  <View style={styles.transporterStat}>
                    <Star size={16} color={theme.colors.warning} />
                    <Text style={styles.transporterStatValue}>
                      {transporter.platformScore.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.transporterStat}>
                    <Package size={16} color={theme.colors.text.tertiary} />
                    <Text style={styles.transporterStatValue}>
                      {transporter.totalTransactions} deliveries
                    </Text>
                  </View>
                  <View style={styles.transporterStat}>
                    <DollarSign size={16} color={theme.colors.success} />
                    <Text style={styles.transporterStatValue}>
                      {formatCurrency(
                        transporter.estimatedCost || transporter.baseRate
                      )}
                      /delivery
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            ))}
          </>
        )}

        {/* Notes */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <AnimatedCard style={styles.inputCard}>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions for delivery..."
            value={formData.notes}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, notes: text }))
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </AnimatedCard>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <AnimatedCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Winning Bid</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(auction?.finalPrice || auction?.currentPrice)}
            </Text>
          </View>
          {formData.usesTransport && formData.transportCost > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Transport Fee (Est.)</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(formData.transportCost)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                parseFloat(auction?.finalPrice || auction?.currentPrice || 0) +
                  (formData.usesTransport ? formData.transportCost : 0)
              )}
            </Text>
          </View>
        </AnimatedCard>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={theme.colors.error} />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <AnimatedButton
          title={submitting ? "Processing..." : "Complete Purchase"}
          variant="primary"
          size="lg"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <Text style={styles.disclaimer}>
          By completing this purchase, you agree to our terms of service. Your
          funds are held in escrow until delivery is confirmed.
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  winnerBanner: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.success + "15",
    borderWidth: 1,
    borderColor: theme.colors.success + "30",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  bannerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warning + "15",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  deadlineText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning,
    fontWeight: theme.typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  productCard: {
    padding: theme.spacing.lg,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  productQuantity: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[600],
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  deliveryCard: {
    padding: theme.spacing.md,
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.sm,
  },
  deliveryOptionSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  deliveryOptionText: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  deliveryOptionTitleSelected: {
    color: theme.colors.primary[600],
  },
  deliveryOptionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  inputCard: {
    padding: theme.spacing.lg,
  },
  notesInput: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: 100,
  },
  transporterCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  transporterCardSelected: {
    borderColor: theme.colors.primary[600],
  },
  transporterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  transporterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  transporterInfo: {
    flex: 1,
  },
  transporterName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  transporterMeta: {
    marginTop: 2,
  },
  transporterVehicle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  transporterStats: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  transporterStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  transporterStatValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  summaryCard: {
    padding: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  totalRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.error + "15",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  errorBoxText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
  disclaimer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 18,
  },
  bottomPadding: {
    height: theme.spacing["2xl"],
  },
});

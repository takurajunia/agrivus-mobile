import React, { useState, useEffect, useCallback } from "react";
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
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicInput,
} from "../../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../../src/theme/neumorphic";
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
      <NeumorphicScreen variant="detail">
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (error && !auction) {
    return (
      <NeumorphicScreen variant="detail">
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="ghost"
          />
          <Text style={styles.title}>Auction Checkout</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle
            size={64}
            color={neumorphicColors.semantic.error}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <NeumorphicButton
            title="View Auction"
            variant="primary"
            size="medium"
            style={{ marginTop: spacing.lg }}
            onPress={() => router.push(`/auction/${id}` as any)}
          />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="form">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
        />
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
            colors={[neumorphicColors.primary[600]]}
            tintColor={neumorphicColors.primary[600]}
          />
        }
      >
        {/* Winner Banner */}
        <NeumorphicCard variant="bordered" style={styles.winnerBanner}>
          <View style={styles.bannerContent}>
            <Trophy size={40} color={neumorphicColors.secondary[500]} />
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
        </NeumorphicCard>

        {/* Deadline Warning */}
        {daysLeft > 0 && daysLeft <= 7 && (
          <View style={styles.deadlineWarning}>
            <Clock size={20} color={neumorphicColors.secondary[500]} />
            <Text style={styles.deadlineText}>
              ⏰ {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining to complete
              checkout
            </Text>
          </View>
        )}

        {/* Product Summary */}
        <Text style={styles.sectionTitle}>Auction Item</Text>
        <NeumorphicCard style={styles.productCard}>
          <View style={styles.productInfo}>
            <Package size={40} color={neumorphicColors.primary[600]} />
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
                  <MapPin size={14} color={neumorphicColors.text.tertiary} />
                  <Text style={styles.locationText}>{listing.location}</Text>
                </View>
              )}
            </View>
          </View>
        </NeumorphicCard>

        {/* Delivery Options */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <NeumorphicCard style={styles.deliveryCard}>
          <NeumorphicCard
            variant={formData.usesTransport ? "bordered" : "standard"}
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
                  ? neumorphicColors.primary[600]
                  : neumorphicColors.text.tertiary
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
              <CheckCircle size={20} color={neumorphicColors.primary[600]} />
            )}
          </NeumorphicCard>

          <NeumorphicCard
            variant={!formData.usesTransport ? "bordered" : "standard"}
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
                  ? neumorphicColors.primary[600]
                  : neumorphicColors.text.tertiary
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
              <CheckCircle size={20} color={neumorphicColors.primary[600]} />
            )}
          </NeumorphicCard>
        </NeumorphicCard>

        {/* Delivery Location */}
        {formData.usesTransport && (
          <>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <NeumorphicCard style={styles.inputCard}>
              <NeumorphicInput
                label="Enter your delivery location"
                placeholder="123 Farm Road, Agricultural District"
                value={formData.deliveryLocation}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, deliveryLocation: text }))
                }
                leftIcon={
                  <MapPin size={20} color={neumorphicColors.text.tertiary} />
                }
              />
            </NeumorphicCard>
          </>
        )}

        {/* Transporters */}
        {formData.usesTransport && transporters.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Select Transporter</Text>
            {transporters.map((transporter) => (
              <NeumorphicCard
                key={transporter.id}
                variant={
                  formData.transporterId === transporter.id
                    ? "bordered"
                    : "standard"
                }
                style={[
                  styles.transporterCard,
                  formData.transporterId === transporter.id &&
                    styles.transporterCardSelected,
                ]}
                onPress={() => handleTransporterSelect(transporter)}
              >
                <View style={styles.transporterHeader}>
                  <View style={styles.transporterAvatar}>
                    <Truck size={24} color={neumorphicColors.primary[600]} />
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
                    <CheckCircle
                      size={24}
                      color={neumorphicColors.primary[600]}
                    />
                  )}
                </View>

                <View style={styles.transporterStats}>
                  <View style={styles.transporterStat}>
                    <Star size={16} color={neumorphicColors.secondary[500]} />
                    <Text style={styles.transporterStatValue}>
                      {transporter.platformScore.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.transporterStat}>
                    <Package size={16} color={neumorphicColors.text.tertiary} />
                    <Text style={styles.transporterStatValue}>
                      {transporter.totalTransactions} deliveries
                    </Text>
                  </View>
                  <View style={styles.transporterStat}>
                    <DollarSign
                      size={16}
                      color={neumorphicColors.semantic.success}
                    />
                    <Text style={styles.transporterStatValue}>
                      {formatCurrency(
                        transporter.estimatedCost || transporter.baseRate
                      )}
                      /delivery
                    </Text>
                  </View>
                </View>
              </NeumorphicCard>
            ))}
          </>
        )}

        {/* Notes */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <NeumorphicCard style={styles.inputCard}>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions for delivery..."
            placeholderTextColor={neumorphicColors.text.tertiary}
            value={formData.notes}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, notes: text }))
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </NeumorphicCard>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <NeumorphicCard style={styles.summaryCard}>
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
        </NeumorphicCard>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={neumorphicColors.semantic.error} />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <NeumorphicButton
          title={submitting ? "Processing..." : "Complete Purchase"}
          variant="primary"
          size="large"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.submitButton}
          fullWidth
        />

        <Text style={styles.disclaimer}>
          By completing this purchase, you agree to our terms of service. Your
          funds are held in escrow until delivery is confirmed.
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    backgroundColor: neumorphicColors.base.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h4,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  winnerBanner: {
    padding: spacing.lg,
    backgroundColor: neumorphicColors.badge.success.bg,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.h5,
    color: neumorphicColors.semantic.success,
  },
  bannerSubtitle: {
    ...typography.bodySmall,
    marginTop: 4,
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: neumorphicColors.badge.warning.bg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  deadlineText: {
    flex: 1,
    ...typography.bodySmall,
    color: neumorphicColors.secondary[700],
    fontWeight: "500",
  },
  sectionTitle: {
    ...typography.h5,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  productCard: {
    padding: spacing.lg,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    ...typography.h5,
  },
  productQuantity: {
    ...typography.body,
    color: neumorphicColors.primary[600],
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  deliveryCard: {
    padding: spacing.md,
    backgroundColor: "transparent",
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  deliveryOptionSelected: {
    backgroundColor: neumorphicColors.primary[50],
  },
  deliveryOptionText: {
    flex: 1,
  },
  deliveryOptionTitle: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
  },
  deliveryOptionTitleSelected: {
    color: neumorphicColors.primary[600],
  },
  deliveryOptionSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  inputCard: {
    padding: spacing.lg,
  },
  notesInput: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body,
    minHeight: 100,
  },
  transporterCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  transporterCardSelected: {
    backgroundColor: neumorphicColors.primary[50],
  },
  transporterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  transporterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  transporterInfo: {
    flex: 1,
  },
  transporterName: {
    ...typography.body,
    fontWeight: "600",
  },
  transporterMeta: {
    marginTop: 2,
  },
  transporterVehicle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  transporterStats: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  transporterStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  transporterStatValue: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
  },
  totalRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.h5,
  },
  totalValue: {
    ...typography.h5,
    color: neumorphicColors.primary[600],
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: neumorphicColors.badge.error.bg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  errorBoxText: {
    flex: 1,
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  disclaimer: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

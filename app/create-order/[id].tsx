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
  Package,
  MapPin,
  Truck,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicInput,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import { listingsService } from "../../src/services/listingsService";
import ordersService from "../../src/services/ordersService";
import { useAuth } from "../../src/contexts/AuthContext";
import type { Listing } from "../../src/types";

interface ListingData {
  listing: Listing;
  farmer?: {
    id: string;
    fullName: string;
    location?: string;
  };
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const { id: listingId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const listing = listingData?.listing;
  const farmer = listingData?.farmer;

  const [formData, setFormData] = useState({
    quantity: "1",
    deliveryLocation: "",
    notes: "",
    transportOption: "platform" as "platform" | "self_pickup",
  });

  const fetchListing = useCallback(
    async (refresh = false) => {
      if (!listingId) {
        setError("No listing specified");
        setLoading(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        }
        setError("");

        const response = await listingsService.getListingById(listingId);

        if (response.success || response.data) {
          if (response.data) {
            setListingData(response.data as ListingData);
          }
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Failed to load listing"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [listingId]
  );

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleRefresh = useCallback(() => {
    fetchListing(true);
  }, [fetchListing]);

  const calculateTotal = () => {
    if (!listing || !formData.quantity) return 0;
    const quantity = parseFloat(formData.quantity);
    const pricePerUnit = parseFloat(listing.pricePerUnit);
    return quantity * pricePerUnit;
  };

  const handleQuantityChange = (delta: number) => {
    const currentQty = parseFloat(formData.quantity) || 0;
    const maxQty = listing ? parseFloat(listing.quantity) : 100;
    const newQty = Math.max(1, Math.min(currentQty + delta, maxQty));
    setFormData((prev) => ({ ...prev, quantity: newQty.toString() }));
  };

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!listing) {
      setError("Listing not found");
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const availableQuantity = parseFloat(listing.quantity);

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (quantity > availableQuantity) {
      setError(
        `Maximum available quantity is ${availableQuantity} ${listing.unit}`
      );
      return;
    }

    if (
      formData.transportOption === "platform" &&
      !formData.deliveryLocation.trim()
    ) {
      setError("Please enter delivery location");
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        listingId: listingId!,
        quantity: formData.quantity,
        deliveryLocation:
          formData.transportOption === "platform"
            ? formData.deliveryLocation
            : listing.location,
        notes: formData.notes,
        usesTransport: formData.transportOption === "platform",
      };

      const response = await ordersService.createOrder(orderData);

      if (response.success) {
        Alert.alert(
          "Order Placed! 🎉",
          "Your order has been created successfully. The farmer will be notified.",
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
        err.response?.data?.message || err.message || "Failed to create order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="form" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (error && !listing) {
    return (
      <NeumorphicScreen variant="form" showLeaves={false}>
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="default"
            size="medium"
          />
          <Text style={styles.title}>Place Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle
            size={64}
            color={neumorphicColors.semantic.error}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <NeumorphicButton
            title="Go Back"
            variant="primary"
            size="medium"
            style={{ marginTop: spacing.lg }}
            onPress={() => router.back()}
          />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="form" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <Text style={styles.title}>Place Order</Text>
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
        {/* Product Summary */}
        <Text style={styles.sectionTitle}>Product</Text>
        <NeumorphicCard style={styles.productCard}>
          <View style={styles.productInfo}>
            <Package size={40} color={neumorphicColors.primary[600]} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{listing?.cropType}</Text>
              <Text style={styles.productPrice}>
                {formatCurrency(parseFloat(listing?.pricePerUnit || "0"))} /{" "}
                {listing?.unit}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={neumorphicColors.text.tertiary} />
                <Text style={styles.locationText}>{listing?.location}</Text>
              </View>
            </View>
          </View>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Available</Text>
            <Text style={styles.stockValue}>
              {listing?.quantity} {listing?.unit}
            </Text>
          </View>
        </NeumorphicCard>

        {/* Quantity Selector */}
        <Text style={styles.sectionTitle}>Quantity</Text>
        <NeumorphicCard style={styles.quantityCard}>
          <View style={styles.quantityRow}>
            <NeumorphicIconButton
              icon={<Minus size={20} color={neumorphicColors.primary[600]} />}
              onPress={() => handleQuantityChange(-1)}
              variant="secondary"
              size="medium"
            />
            <View style={styles.quantityInput}>
              <TextInput
                style={styles.quantityValue}
                value={formData.quantity}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9.]/g, "");
                  setFormData((prev) => ({ ...prev, quantity: num }));
                }}
                keyboardType="numeric"
              />
              <Text style={styles.quantityUnit}>{listing?.unit}</Text>
            </View>
            <NeumorphicIconButton
              icon={<Plus size={20} color={neumorphicColors.primary[600]} />}
              onPress={() => handleQuantityChange(1)}
              variant="secondary"
              size="medium"
            />
          </View>
        </NeumorphicCard>

        {/* Delivery Options */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <NeumorphicCard style={styles.deliveryCard}>
          <NeumorphicCard
            style={[
              styles.deliveryOption,
              formData.transportOption === "platform" &&
                styles.deliveryOptionSelected,
            ]}
            onPress={() =>
              setFormData((prev) => ({ ...prev, transportOption: "platform" }))
            }
            variant="bordered"
          >
            <View style={styles.deliveryOptionContent}>
              <Truck
                size={24}
                color={
                  formData.transportOption === "platform"
                    ? neumorphicColors.primary[600]
                    : neumorphicColors.text.tertiary
                }
              />
              <View style={styles.deliveryOptionText}>
                <Text
                  style={[
                    styles.deliveryOptionTitle,
                    formData.transportOption === "platform" &&
                      styles.deliveryOptionTitleSelected,
                  ]}
                >
                  🚚 Use Platform Transport
                </Text>
                <Text style={styles.deliveryOptionSubtitle}>
                  We'll arrange delivery for you
                </Text>
              </View>
              {formData.transportOption === "platform" && (
                <CheckCircle size={20} color={neumorphicColors.primary[600]} />
              )}
            </View>
          </NeumorphicCard>

          <NeumorphicCard
            style={[
              styles.deliveryOption,
              formData.transportOption === "self_pickup" &&
                styles.deliveryOptionSelected,
            ]}
            onPress={() =>
              setFormData((prev) => ({
                ...prev,
                transportOption: "self_pickup",
              }))
            }
            variant="bordered"
          >
            <View style={styles.deliveryOptionContent}>
              <MapPin
                size={24}
                color={
                  formData.transportOption === "self_pickup"
                    ? neumorphicColors.primary[600]
                    : neumorphicColors.text.tertiary
                }
              />
              <View style={styles.deliveryOptionText}>
                <Text
                  style={[
                    styles.deliveryOptionTitle,
                    formData.transportOption === "self_pickup" &&
                      styles.deliveryOptionTitleSelected,
                  ]}
                >
                  📦 Self Pickup
                </Text>
                <Text style={styles.deliveryOptionSubtitle}>
                  Pick up from seller's location
                </Text>
              </View>
              {formData.transportOption === "self_pickup" && (
                <CheckCircle size={20} color={neumorphicColors.primary[600]} />
              )}
            </View>
          </NeumorphicCard>
        </NeumorphicCard>

        {/* Delivery Location */}
        {formData.transportOption === "platform" && (
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

        {/* Notes */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <NeumorphicCard style={styles.inputCard}>
          <NeumorphicInput
            placeholder="Any special instructions for the order..."
            value={formData.notes}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, notes: text }))
            }
            multiline
            numberOfLines={4}
            variant="textarea"
          />
        </NeumorphicCard>

        {/* Seller Info */}
        {farmer && (
          <>
            <Text style={styles.sectionTitle}>Seller</Text>
            <NeumorphicCard style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <User size={24} color={neumorphicColors.primary[600]} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{farmer.fullName}</Text>
                {farmer.location && (
                  <Text style={styles.sellerLocation}>{farmer.location}</Text>
                )}
              </View>
            </NeumorphicCard>
          </>
        )}

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <NeumorphicCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {formData.quantity} × {listing?.unit} @{" "}
              {formatCurrency(parseFloat(listing?.pricePerUnit || "0"))}
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(calculateTotal())}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transport Fee</Text>
            <Text style={styles.summaryValue}>
              {formData.transportOption === "platform" ? "TBD" : "Self Pickup"}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculateTotal())}
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
          title={submitting ? "Creating Order..." : "Place Order"}
          variant="primary"
          size="large"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.submitButton}
          fullWidth
        />

        <Text style={styles.disclaimer}>
          By placing this order, you agree to our terms of service. Your payment
          will be held in escrow until delivery is confirmed.
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
    backgroundColor: neumorphicColors.base.card,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
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
    fontSize: typography.body.fontSize,
    color: neumorphicColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    fontSize: typography.body.fontSize,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: typography.h5.fontSize,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
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
    fontSize: typography.h5.fontSize,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  productPrice: {
    fontSize: typography.body.fontSize,
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
    fontSize: typography.bodySmall.fontSize,
    color: neumorphicColors.text.tertiary,
  },
  stockInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stockLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: neumorphicColors.text.secondary,
  },
  stockValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "600",
    color: neumorphicColors.semantic.success,
  },
  quantityCard: {
    padding: spacing.lg,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  quantityInput: {
    flexDirection: "row",
    alignItems: "baseline",
    minWidth: 120,
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: 32,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    textAlign: "center",
    minWidth: 80,
  },
  quantityUnit: {
    fontSize: typography.body.fontSize,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.xs,
  },
  deliveryCard: {
    padding: spacing.md,
  },
  deliveryOption: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  deliveryOptionSelected: {
    borderColor: neumorphicColors.primary[600],
    backgroundColor: neumorphicColors.primary[50],
  },
  deliveryOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  deliveryOptionText: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
  },
  deliveryOptionTitleSelected: {
    color: neumorphicColors.primary[600],
  },
  deliveryOptionSubtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  inputCard: {
    padding: spacing.lg,
  },
  sellerCard: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  sellerLocation: {
    fontSize: typography.bodySmall.fontSize,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
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
    fontSize: typography.body.fontSize,
    color: neumorphicColors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.body.fontSize,
    color: neumorphicColors.text.primary,
  },
  totalRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.h5.fontSize,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  totalValue: {
    fontSize: typography.h5.fontSize,
    fontWeight: "700",
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
    fontSize: typography.bodySmall.fontSize,
    color: neumorphicColors.semantic.error,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  disclaimer: {
    fontSize: typography.bodySmall.fontSize,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

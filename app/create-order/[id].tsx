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
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import GlassCard from "../../src/components/GlassCard";
import ModernInput from "../../src/components/ModernInput";
import { theme } from "../../src/theme/tokens";
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Place Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={theme.colors.error} strokeWidth={1} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <AnimatedButton
            title="Go Back"
            variant="primary"
            size="md"
            style={{ marginTop: theme.spacing.lg }}
            onPress={() => router.back()}
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
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {/* Product Summary */}
        <Text style={styles.sectionTitle}>Product</Text>
        <AnimatedCard style={styles.productCard}>
          <View style={styles.productInfo}>
            <Package size={40} color={theme.colors.primary[600]} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{listing?.cropType}</Text>
              <Text style={styles.productPrice}>
                {formatCurrency(parseFloat(listing?.pricePerUnit || "0"))} /{" "}
                {listing?.unit}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={theme.colors.text.tertiary} />
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
        </AnimatedCard>

        {/* Quantity Selector */}
        <Text style={styles.sectionTitle}>Quantity</Text>
        <AnimatedCard style={styles.quantityCard}>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Minus size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Plus size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Delivery Options */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <AnimatedCard style={styles.deliveryCard}>
          <TouchableOpacity
            style={[
              styles.deliveryOption,
              formData.transportOption === "platform" &&
                styles.deliveryOptionSelected,
            ]}
            onPress={() =>
              setFormData((prev) => ({ ...prev, transportOption: "platform" }))
            }
          >
            <Truck
              size={24}
              color={
                formData.transportOption === "platform"
                  ? theme.colors.primary[600]
                  : theme.colors.text.tertiary
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
              <CheckCircle size={20} color={theme.colors.primary[600]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
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
          >
            <MapPin
              size={24}
              color={
                formData.transportOption === "self_pickup"
                  ? theme.colors.primary[600]
                  : theme.colors.text.tertiary
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
              <CheckCircle size={20} color={theme.colors.primary[600]} />
            )}
          </TouchableOpacity>
        </AnimatedCard>

        {/* Delivery Location */}
        {formData.transportOption === "platform" && (
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

        {/* Notes */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <AnimatedCard style={styles.inputCard}>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions for the order..."
            value={formData.notes}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, notes: text }))
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </AnimatedCard>

        {/* Seller Info */}
        {farmer && (
          <>
            <Text style={styles.sectionTitle}>Seller</Text>
            <AnimatedCard style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <User size={24} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{farmer.fullName}</Text>
                {farmer.location && (
                  <Text style={styles.sellerLocation}>{farmer.location}</Text>
                )}
              </View>
            </AnimatedCard>
          </>
        )}

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <AnimatedCard style={styles.summaryCard}>
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
          title={submitting ? "Creating Order..." : "Place Order"}
          variant="primary"
          size="lg"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <Text style={styles.disclaimer}>
          By placing this order, you agree to our terms of service. Your payment
          will be held in escrow until delivery is confirmed.
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
  productPrice: {
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
  stockInfo: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stockLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  stockValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  quantityCard: {
    padding: theme.spacing.lg,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    flexDirection: "row",
    alignItems: "baseline",
    minWidth: 120,
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    minWidth: 80,
  },
  quantityUnit: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
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
  sellerCard: {
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  sellerLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
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

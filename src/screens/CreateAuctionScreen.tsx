import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Gavel,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import { auctionsService } from "../services/auctionsService";
import { listingsService } from "../services/listingsService";
import type { Listing } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

export default function CreateAuctionScreen() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    listingId: listingId || "",
    startingPrice: "",
    reservePrice: "",
    minBidIncrement: "10",
    duration: "24", // hours
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoadingListing(true);
      const response = await listingsService.getListingById(listingId!);
      const listingData = response.data?.listing;
      setListing(listingData || null);

      // Set default starting price based on listing price
      if (listingData?.pricePerUnit && listingData?.quantity) {
        const totalValue =
          parseFloat(listingData.pricePerUnit) *
          parseFloat(listingData.quantity);
        setFormData((prev) => ({
          ...prev,
          startingPrice: (totalValue * 0.7).toFixed(2), // 70% of total value as default
          reservePrice: (totalValue * 0.9).toFixed(2), // 90% as reserve
        }));
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to load listing details");
    } finally {
      setLoadingListing(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.listingId) {
      newErrors.listingId = "Please select a listing";
    }

    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
      newErrors.startingPrice = "Starting price is required";
    }

    if (
      formData.reservePrice &&
      parseFloat(formData.reservePrice) < parseFloat(formData.startingPrice)
    ) {
      newErrors.reservePrice =
        "Reserve price must be higher than starting price";
    }

    if (
      !formData.minBidIncrement ||
      parseFloat(formData.minBidIncrement) <= 0
    ) {
      newErrors.minBidIncrement = "Minimum bid increment is required";
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = "Duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      await auctionsService.createAuction({
        listingId: formData.listingId,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        bidIncrement: parseFloat(formData.minBidIncrement),
        durationHours: parseInt(formData.duration),
      });

      Alert.alert("Success", "Auction created successfully!", [
        { text: "OK", onPress: () => router.push("/auctions") },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create auction"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const durations = [
    { label: "6 hours", value: "6" },
    { label: "12 hours", value: "12" },
    { label: "24 hours", value: "24" },
    { label: "48 hours", value: "48" },
    { label: "72 hours", value: "72" },
    { label: "7 days", value: "168" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Auction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Listing Preview */}
        {loadingListing ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : listing ? (
          <AnimatedCard style={styles.listingCard}>
            <Text style={styles.sectionTitle}>Selected Listing</Text>
            <View style={styles.listingInfo}>
              <Text style={styles.listingCrop}>{listing.cropType}</Text>
              <Text style={styles.listingDetails}>
                {listing.quantity} {listing.unit} • {listing.location}
              </Text>
              <Text style={styles.listingPrice}>
                ${parseFloat(listing.pricePerUnit).toLocaleString()} /{" "}
                {listing.unit}
              </Text>
            </View>
          </AnimatedCard>
        ) : (
          <AnimatedCard style={styles.selectListingCard}>
            <Gavel size={40} color={theme.colors.text.tertiary} />
            <Text style={styles.selectListingTitle}>Select a Listing</Text>
            <Text style={styles.selectListingText}>
              Choose a listing from your inventory to put up for auction
            </Text>
            <TouchableOpacity
              style={styles.selectListingButton}
              onPress={() => router.push("/my-listings?select=true")}
            >
              <Text style={styles.selectListingButtonText}>
                Browse Listings
              </Text>
            </TouchableOpacity>
          </AnimatedCard>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Starting Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Starting Price *</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.startingPrice && styles.inputError,
              ]}
            >
              <DollarSign size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.input}
                value={formData.startingPrice}
                onChangeText={(text) =>
                  setFormData({ ...formData, startingPrice: text })
                }
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.startingPrice && (
              <Text style={styles.errorText}>{errors.startingPrice}</Text>
            )}
            <Text style={styles.helperText}>
              The minimum amount bidders can start bidding at
            </Text>
          </View>

          {/* Reserve Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reserve Price (Optional)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.input}
                value={formData.reservePrice}
                onChangeText={(text) =>
                  setFormData({ ...formData, reservePrice: text })
                }
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.reservePrice && (
              <Text style={styles.errorText}>{errors.reservePrice}</Text>
            )}
            <Text style={styles.helperText}>
              Minimum price you're willing to accept (hidden from bidders)
            </Text>
          </View>

          {/* Min Bid Increment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Bid Increment *</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.minBidIncrement && styles.inputError,
              ]}
            >
              <TrendingUp size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.input}
                value={formData.minBidIncrement}
                onChangeText={(text) =>
                  setFormData({ ...formData, minBidIncrement: text })
                }
                placeholder="10"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.minBidIncrement && (
              <Text style={styles.errorText}>{errors.minBidIncrement}</Text>
            )}
            <Text style={styles.helperText}>
              Each new bid must be at least this much higher than the previous
            </Text>
          </View>

          {/* Duration */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Auction Duration *</Text>
            <View style={styles.durationContainer}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.value}
                  style={[
                    styles.durationOption,
                    formData.duration === duration.value &&
                      styles.durationOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, duration: duration.value })
                  }
                >
                  <Text
                    style={[
                      styles.durationText,
                      formData.duration === duration.value &&
                        styles.durationTextSelected,
                    ]}
                  >
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.duration && (
              <Text style={styles.errorText}>{errors.duration}</Text>
            )}
          </View>

          {/* Summary */}
          {listing && formData.startingPrice && (
            <AnimatedCard style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Auction Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Item</Text>
                <Text style={styles.summaryValue}>{listing.cropType}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryValue}>
                  {listing.quantity} {listing.unit}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Starting Price</Text>
                <Text style={styles.summaryValue}>
                  ${parseFloat(formData.startingPrice).toLocaleString()}
                </Text>
              </View>
              {formData.reservePrice && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Reserve Price</Text>
                  <Text style={styles.summaryValue}>
                    ${parseFloat(formData.reservePrice).toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>
                  {durations.find((d) => d.value === formData.duration)?.label}
                </Text>
              </View>
            </AnimatedCard>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || !listing) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || !listing}
        >
          <Gavel size={20} color={theme.colors.text.inverse} />
          <Text style={styles.submitButtonText}>
            {submitting ? "Creating Auction..." : "Create Auction"}
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: theme.spacing["3xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  listingCard: {
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  listingInfo: {},
  listingCrop: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  listingDetails: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  listingPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
  },
  selectListingCard: {
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing["3xl"],
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  selectListingTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  selectListingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  selectListingButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
  },
  selectListingButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  durationOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  durationOptionSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  durationText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  durationTextSelected: {
    color: theme.colors.text.inverse,
  },
  summaryCard: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  bottomPadding: {
    height: theme.spacing["3xl"],
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});

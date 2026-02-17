import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { auctionsService } from "../services/auctionsService";
import { listingsService } from "../services/listingsService";
import type { Listing } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../components/neumorphic/NeumorphicIconButton";
import NeumorphicInput from "../components/neumorphic/NeumorphicInput";

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
    <NeumorphicScreen variant="default">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ChevronLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="flat"
          size="md"
        />
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
          <NeumorphicCard style={styles.listingCard}>
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
          </NeumorphicCard>
        ) : (
          <NeumorphicCard style={styles.selectListingCard}>
            <Gavel size={40} color={neumorphicColors.text.tertiary} />
            <Text style={styles.selectListingTitle}>Select a Listing</Text>
            <Text style={styles.selectListingText}>
              Choose a listing from your inventory to put up for auction
            </Text>
            <NeumorphicButton
              title="Browse Listings"
              onPress={() => router.push("/my-listings?select=true")}
              variant="primary"
              size="md"
              style={{ marginTop: spacing.xl }}
            />
          </NeumorphicCard>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Starting Price */}
          <NeumorphicInput
            label="Starting Price *"
            value={formData.startingPrice}
            onChangeText={(text) =>
              setFormData({ ...formData, startingPrice: text })
            }
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.startingPrice}
            leftIcon={
              <DollarSign size={20} color={neumorphicColors.text.secondary} />
            }
            helperText="The minimum amount bidders can start bidding at"
          />

          {/* Reserve Price */}
          <NeumorphicInput
            label="Reserve Price (Optional)"
            value={formData.reservePrice}
            onChangeText={(text) =>
              setFormData({ ...formData, reservePrice: text })
            }
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.reservePrice}
            leftIcon={
              <DollarSign size={20} color={neumorphicColors.text.secondary} />
            }
            helperText="Minimum price you're willing to accept (hidden from bidders)"
          />

          {/* Min Bid Increment */}
          <NeumorphicInput
            label="Minimum Bid Increment *"
            value={formData.minBidIncrement}
            onChangeText={(text) =>
              setFormData({ ...formData, minBidIncrement: text })
            }
            placeholder="10"
            keyboardType="decimal-pad"
            error={errors.minBidIncrement}
            leftIcon={
              <TrendingUp size={20} color={neumorphicColors.text.secondary} />
            }
            helperText="Each new bid must be at least this much higher than the previous"
          />

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
            <NeumorphicCard style={styles.summaryCard} variant="elevated">
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
                  ${parseFloat(formData.startingPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              {formData.reservePrice && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Reserve Price</Text>
                  <Text style={styles.summaryValue}>
                    ${parseFloat(formData.reservePrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>
                  {durations.find((d) => d.value === formData.duration)?.label}
                </Text>
              </View>
            </NeumorphicCard>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <NeumorphicCard style={styles.footer} variant="elevated">
        <NeumorphicButton
          title={submitting ? "Creating Auction..." : "Create Auction"}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={submitting || !listing}
          icon={<Gavel size={20} color={neumorphicColors.text.inverse} />}
        />
      </NeumorphicCard>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  headerTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing["2xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  listingCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  listingInfo: {},
  listingCrop: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  listingDetails: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  listingPrice: {
    ...typography.h5,
    color: neumorphicColors.primary.main,
    marginTop: spacing.sm,
  },
  selectListingCard: {
    margin: spacing.lg,
    padding: spacing["2xl"],
    alignItems: "center",
  },
  selectListingTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  selectListingText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: neumorphicColors.semantic.error,
    marginTop: spacing.xs,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  durationOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: neumorphicColors.base.card,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
  },
  durationOptionSelected: {
    backgroundColor: neumorphicColors.primary.main,
    borderColor: neumorphicColors.primary.main,
  },
  durationText: {
    ...typography.caption,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
  },
  durationTextSelected: {
    color: neumorphicColors.text.inverse,
  },
  summaryCard: {
    padding: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: neumorphicColors.primary.light,
  },
  summaryTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.border,
  },
  summaryLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.primary,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  footer: {
    margin: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
});

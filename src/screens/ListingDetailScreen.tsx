import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  MapPin,
  Calendar,
  User,
  Star,
  Package,
  ChevronLeft,
  ShoppingCart,
  MessageCircle,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";
import { listingsService } from "../services/listingsService";
import type { ListingWithFarmer } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicBadge,
} from "../components/neumorphic";

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listingData, setListingData] = useState<ListingWithFarmer | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listingsService.getListingById(id!);
      if (response.data) {
        setListingData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (listingData?.listing) {
      router.push(`/chat/${listingData.listing.farmerId}`);
    }
  };

  const handleOrder = () => {
    router.push(`/create-order/${listingData?.listing?.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  if (error || !listingData) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={
              <ChevronLeft size={24} color={neumorphicColors.text.primary} />
            }
            onPress={() => router.back()}
            variant="ghost"
          />
          <Text style={styles.headerTitle}>Listing Details</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Listing not found"}</Text>
          <NeumorphicButton
            title="Retry"
            onPress={fetchListing}
            variant="primary"
            size="medium"
          />
        </View>
      </NeumorphicScreen>
    );
  }

  const { listing, farmer } = listingData;

  return (
    <NeumorphicScreen variant="detail" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ChevronLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text style={styles.headerTitle}>{listing.cropType}</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.mainImageContainer}>
            {listing.images && listing.images.length > 0 ? (
              <Image
                source={{ uri: listing.images[selectedImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🌾</Text>
              </View>
            )}
          </View>

          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {listing.images.map((image: string, index: number) => (
                <NeumorphicCard
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail,
                  ]}
                  variant="standard"
                  shadowLevel={1}
                  animated={false}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </NeumorphicCard>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Listing Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.cropType}</Text>
            <NeumorphicBadge
              label={listing.status.toUpperCase()}
              variant="success"
              size="small"
            />
          </View>

          <Text style={styles.price}>
            ${parseFloat(listing.pricePerUnit).toLocaleString()} /{" "}
            {listing.unit}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Package size={20} color={neumorphicColors.primary[600]} />
              <View>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>
                  {listing.quantity} {listing.unit}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MapPin size={20} color={neumorphicColors.primary[600]} />
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{listing.location}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Calendar size={20} color={neumorphicColors.primary[600]} />
              <View>
                <Text style={styles.detailLabel}>Listed</Text>
                <Text style={styles.detailValue}>
                  {formatDate(listing.createdAt)}
                </Text>
              </View>
            </View>

            {listing.harvestDate && (
              <View style={styles.detailItem}>
                <Calendar size={20} color={neumorphicColors.semantic.success} />
                <View>
                  <Text style={styles.detailLabel}>Harvest Date</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(listing.harvestDate)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {listing.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}
        </View>

        {/* Farmer Info */}
        {farmer && (
          <NeumorphicCard style={styles.farmerCard} variant="elevated">
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.farmerInfo}>
              <View style={styles.farmerAvatar}>
                <User size={28} color={neumorphicColors.primary[600]} />
              </View>
              <View style={styles.farmerDetails}>
                <Text style={styles.farmerName}>{farmer.fullName}</Text>
                {farmer.platformScore > 0 && (
                  <View style={styles.ratingContainer}>
                    <Star
                      size={14}
                      color={neumorphicColors.semantic.warning}
                      fill={neumorphicColors.semantic.warning}
                    />
                    <Text style={styles.ratingText}>
                      {farmer.platformScore} platform score
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </NeumorphicCard>
        )}

        {/* Total Value */}
        <NeumorphicCard style={styles.totalSection} variant="standard">
          <Text style={styles.totalLabel}>Total Value</Text>
          <Text style={styles.totalValue}>
            $
            {(
              parseFloat(listing.pricePerUnit) * parseFloat(listing.quantity)
            ).toLocaleString()}
          </Text>
        </NeumorphicCard>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <NeumorphicButton
          title="Contact Seller"
          onPress={handleContact}
          variant="secondary"
          icon={
            <MessageCircle size={20} color={neumorphicColors.primary[600]} />
          }
          style={styles.actionButton}
        />
        <NeumorphicButton
          title="Place Order"
          onPress={handleOrder}
          variant="primary"
          icon={
            <ShoppingCart size={20} color={neumorphicColors.text.inverse} />
          }
          style={styles.actionButton}
        />
      </View>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    backgroundColor: neumorphicColors.base.card,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.shadowDark,
  },
  headerTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: neumorphicColors.semantic.error,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    backgroundColor: neumorphicColors.base.card,
  },
  mainImageContainer: {
    width: "100%",
    height: 300,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 80,
  },
  thumbnailScroll: {
    paddingVertical: spacing.md,
  },
  thumbnailContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    padding: 0,
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: neumorphicColors.primary[600],
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    backgroundColor: neumorphicColors.base.card,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  price: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
    marginTop: spacing.sm,
  },
  detailsGrid: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  detailValue: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.primary,
  },
  descriptionSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    lineHeight: 24,
  },
  farmerCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  farmerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  farmerAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  farmerDetails: {
    flex: 1,
  },
  farmerName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  farmerLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  farmerLocationText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  ratingText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  totalSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  totalLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  totalValue: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  bottomActions: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: neumorphicColors.base.card,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

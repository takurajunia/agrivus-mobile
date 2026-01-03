import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  MapPin,
  Calendar,
  User,
  Phone,
  Star,
  Package,
  ChevronLeft,
  ShoppingCart,
  MessageCircle,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import { listingsService } from "../services/listingsService";
import type { Listing, ListingWithFarmer } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Listing not found"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchListing}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { listing, farmer } = listingData;

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
        <Text style={styles.headerTitle}>{listing.cropType}</Text>
        <View style={{ width: 40 }} />
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
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail,
                  ]}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Listing Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.cropType}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {listing.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.price}>
            ${parseFloat(listing.pricePerUnit).toLocaleString()} /{" "}
            {listing.unit}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Package size={20} color={theme.colors.primary[600]} />
              <View>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>
                  {listing.quantity} {listing.unit}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MapPin size={20} color={theme.colors.primary[600]} />
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{listing.location}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Calendar size={20} color={theme.colors.primary[600]} />
              <View>
                <Text style={styles.detailLabel}>Listed</Text>
                <Text style={styles.detailValue}>
                  {formatDate(listing.createdAt)}
                </Text>
              </View>
            </View>

            {listing.harvestDate && (
              <View style={styles.detailItem}>
                <Calendar size={20} color={theme.colors.success} />
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
          <AnimatedCard style={styles.farmerCard}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.farmerInfo}>
              <View style={styles.farmerAvatar}>
                <User size={28} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.farmerDetails}>
                <Text style={styles.farmerName}>{farmer.fullName}</Text>
                {farmer.platformScore > 0 && (
                  <View style={styles.ratingContainer}>
                    <Star
                      size={14}
                      color={theme.colors.warning}
                      fill={theme.colors.warning}
                    />
                    <Text style={styles.ratingText}>
                      {farmer.platformScore} platform score
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Total Value */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Value</Text>
          <Text style={styles.totalValue}>
            $
            {(
              parseFloat(listing.pricePerUnit) * parseFloat(listing.quantity)
            ).toLocaleString()}
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <MessageCircle size={20} color={theme.colors.primary[600]} />
          <Text style={styles.contactButtonText}>Contact Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <ShoppingCart size={20} color={theme.colors.text.inverse} />
          <Text style={styles.orderButtonText}>Place Order</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    backgroundColor: theme.colors.background.primary,
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
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 80,
  },
  thumbnailScroll: {
    paddingVertical: theme.spacing.md,
  },
  thumbnailContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    borderColor: theme.colors.primary[600],
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    backgroundColor: theme.colors.success + "20",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  price: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
  },
  detailsGrid: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  descriptionSection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  farmerCard: {
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  farmerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  farmerAvatar: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  farmerDetails: {
    flex: 1,
  },
  farmerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  farmerLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  farmerLocationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  totalSection: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  bottomPadding: {
    height: theme.spacing["3xl"],
  },
  bottomActions: {
    flexDirection: "row",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  contactButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  orderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  orderButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
});

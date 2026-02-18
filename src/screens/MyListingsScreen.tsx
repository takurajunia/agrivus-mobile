import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicBadge,
} from "../components/neumorphic";
import { listingsService } from "../services/listingsService";
import type { Listing } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import OptimizedImage from "../components/OptimizedImage";

export default function MyListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listingsService.getMyListings();
      setListings(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await listingsService.deleteListing(id);
              fetchListings();
              Alert.alert("Success", "Listing deleted successfully");
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to delete listing"
              );
            }
          },
        },
      ]
    );
  };

  const getStatusVariant = (
    status: string
  ): "success" | "info" | "error" | "warning" | "neutral" => {
    switch (status) {
      case "active":
        return "success";
      case "sold":
        return "info";
      case "expired":
        return "error";
      case "draft":
        return "warning";
      default:
        return "neutral";
    }
  };

  if (loading && !refreshing) {
    return (
      <NeumorphicScreen variant="list">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Listings</Text>
          <Text style={styles.subtitle}>
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <NeumorphicIconButton
          icon={<Plus size={20} color={neumorphicColors.text.inverse} />}
          onPress={() => router.push("/create-listing")}
          variant="primary"
          size="medium"
        />
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            onPress={fetchListings}
            variant="danger"
            size="small"
          />
        </View>
      ) : null}

      {/* Listings */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color={neumorphicColors.text.tertiary} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
              Create your first listing to start selling
            </Text>
            <NeumorphicButton
              title="Create Listing"
              onPress={() => router.push("/create-listing")}
              variant="primary"
              icon={<Plus size={20} color={neumorphicColors.text.inverse} />}
              iconPosition="left"
              style={{ marginTop: spacing.xl }}
            />
          </View>
        ) : (
          listings.map((listing, index) => (
            <NeumorphicCard
              key={listing.id}
              style={styles.listingCard}
              onPress={() => router.push(`/listing/${listing.id}`)}
              variant="standard"
              animationDelay={index * 100}
            >
              <View style={styles.cardContent}>
                {/* Image */}
                <View style={styles.imageContainer}>
                  {listing.images && listing.images.length > 0 ? (
                    <OptimizedImage
                      uri={listing.images[0]}
                      style={styles.listingImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>🌾</Text>
                    </View>
                  )}
                  <View style={styles.statusBadgeContainer}>
                    <NeumorphicBadge
                      label={listing.status.toUpperCase()}
                      variant={getStatusVariant(listing.status)}
                      size="small"
                    />
                  </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.cropType}>{listing.cropType}</Text>
                  <Text style={styles.quantity}>
                    {listing.quantity} {listing.unit}
                  </Text>

                  <View style={styles.detailRow}>
                    <DollarSign
                      size={14}
                      color={neumorphicColors.primary[600]}
                    />
                    <Text style={styles.price}>
                      ${parseFloat(listing.pricePerUnit).toLocaleString()}/
                      {listing.unit}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin size={14} color={neumorphicColors.text.secondary} />
                    <Text style={styles.location}>{listing.location}</Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Eye size={12} color={neumorphicColors.text.tertiary} />
                      <Text style={styles.statText}>{listing.viewCount}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <NeumorphicButton
                  title="Edit"
                  onPress={() => router.push(`/listing/${listing.id}/edit`)}
                  variant="tertiary"
                  size="small"
                  icon={
                    <Edit2 size={16} color={neumorphicColors.primary[600]} />
                  }
                  iconPosition="left"
                  style={styles.actionButton}
                />
                <NeumorphicButton
                  title="Delete"
                  onPress={() => handleDelete(listing.id)}
                  variant="danger"
                  size="small"
                  icon={
                    <Trash2 size={16} color={neumorphicColors.semantic.error} />
                  }
                  iconPosition="left"
                  style={styles.actionButton}
                />
              </View>
            </NeumorphicCard>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: neumorphicColors.semantic.error + "10",
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  errorText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  listingCard: {
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: spacing.md,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  listingImage: {
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
    fontSize: 40,
  },
  statusBadgeContainer: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cropType: {
    ...typography.h5,
  },
  quantity: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  price: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.primary[600],
  },
  location: {
    ...typography.bodySmall,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    ...typography.caption,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark + "30",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
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
import { theme } from "../theme/tokens";
import { listingsService } from "../services/listingsService";
import type { Listing } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.colors.success;
      case "sold":
        return theme.colors.info;
      case "expired":
        return theme.colors.error;
      case "draft":
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Listings</Text>
          <Text style={styles.subtitle}>
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-listing")}
        >
          <Plus size={20} color={theme.colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchListings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
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
            colors={[theme.colors.primary[600]]}
          />
        }
      >
        {listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
              Create your first listing to start selling
            </Text>
            <TouchableOpacity
              style={styles.createListingButton}
              onPress={() => router.push("/create-listing")}
            >
              <Plus size={20} color={theme.colors.text.inverse} />
              <Text style={styles.createListingButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          listings.map((listing) => (
            <AnimatedCard
              key={listing.id}
              style={styles.listingCard}
              onPress={() => router.push(`/listing/${listing.id}`)}
            >
              <View style={styles.cardContent}>
                {/* Image */}
                <View style={styles.imageContainer}>
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      source={{ uri: listing.images[0] }}
                      style={styles.listingImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>🌾</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(listing.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(listing.status) },
                      ]}
                    >
                      {listing.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.cropType}>{listing.cropType}</Text>
                  <Text style={styles.quantity}>
                    {listing.quantity} {listing.unit}
                  </Text>

                  <View style={styles.detailRow}>
                    <DollarSign size={14} color={theme.colors.primary[600]} />
                    <Text style={styles.price}>
                      ${parseFloat(listing.pricePerUnit).toLocaleString()}/
                      {listing.unit}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin size={14} color={theme.colors.text.secondary} />
                    <Text style={styles.location}>{listing.location}</Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Eye size={12} color={theme.colors.text.tertiary} />
                      <Text style={styles.statText}>{listing.viewCount}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/listing/${listing.id}/edit`)}
                >
                  <Edit2 size={18} color={theme.colors.primary[600]} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(listing.id)}
                >
                  <Trash2 size={18} color={theme.colors.error} />
                  <Text style={[styles.actionText, styles.deleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          ))
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  createButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.md,
  },
  errorContainer: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.error + "10",
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  createListingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  createListingButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
  },
  listingCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: "row",
    padding: theme.spacing.md,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  listingImage: {
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
    fontSize: 40,
  },
  statusBadge: {
    position: "absolute",
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  infoContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cropType: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  quantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  price: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  location: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border.light,
  },
  deleteText: {
    color: theme.colors.error,
  },
  bottomPadding: {
    height: theme.spacing["3xl"],
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  Filter,
  MapPin,
  Star,
  TrendingUp,
  ChevronDown,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import { listingsService } from "../services/listingsService";
import type { ListingWithFarmer, ListingFilters } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";
import BoostBadge from "../components/BoostBadge";

const CROP_TYPES = [
  "All",
  "Maize",
  "Wheat",
  "Soybean",
  "Tobacco",
  "Cotton",
  "Groundnuts",
  "Sunflower",
  "Vegetables",
  "Fruits",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 20,
    sortBy: "date_desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listingsService.getListings(filters);

      if (response.success && response.data) {
        setListings(response.data.listings);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const renderListingCard = ({ item }: { item: ListingWithFarmer }) => {
    const { listing, farmer } = item;
    const boostMultiplier = farmer.boostMultiplier
      ? parseFloat(farmer.boostMultiplier)
      : 1;

    return (
      <AnimatedCard
        style={styles.listingCard}
        onPress={() => router.push(`/listing/${listing.id}`)}
      >
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
          {boostMultiplier > 1 && (
            <View style={styles.boostBadgeContainer}>
              <BoostBadge label={`${boostMultiplier.toFixed(1)}x`} />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cropType}>{listing.cropType}</Text>
          <Text style={styles.quantity}>
            {listing.quantity} {listing.unit}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${parseFloat(listing.pricePerUnit).toLocaleString()}
            </Text>
            <Text style={styles.perUnit}>per {listing.unit}</Text>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={14} color={theme.colors.text.secondary} />
            <Text style={styles.location}>{listing.location}</Text>
          </View>

          <View style={styles.farmerRow}>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{farmer.fullName}</Text>
              <View style={styles.scoreContainer}>
                <Star size={12} color={theme.colors.secondary[500]} />
                <Text style={styles.score}>{farmer.platformScore}</Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>
          Browse agricultural products from verified farmers
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={filters.search || ""}
            onChangeText={(text) => handleFilterChange("search", text)}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {/* Filter Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTags}
        contentContainerStyle={styles.filterTagsContent}
      >
        {CROP_TYPES.map((crop) => (
          <TouchableOpacity
            key={crop}
            style={[
              styles.filterTag,
              (filters.cropType === crop ||
                (crop === "All" && !filters.cropType)) &&
                styles.filterTagActive,
            ]}
            onPress={() =>
              handleFilterChange("cropType", crop === "All" ? undefined : crop)
            }
          >
            <Text
              style={[
                styles.filterTagText,
                (filters.cropType === crop ||
                  (crop === "All" && !filters.cropType)) &&
                  styles.filterTagTextActive,
              ]}
            >
              {crop}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Boost Info Banner */}
      <View style={styles.boostBanner}>
        <TrendingUp size={20} color={theme.colors.primary[600]} />
        <Text style={styles.boostText}>
          Smart Ranking: Top sellers appear first
        </Text>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchListings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Listings */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.listing.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary[600]]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🌾</Text>
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          }
          ListFooterComponent={
            pagination.page < pagination.totalPages ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() =>
                  handleFilterChange("page", (filters.page || 1) + 1)
                }
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  filterTags: {
    marginTop: theme.spacing.md,
    maxHeight: 44,
  },
  filterTagsContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterTagActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  filterTagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  filterTagTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  boostBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  boostText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  columnWrapper: {
    gap: theme.spacing.md,
  },
  listingCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  imageContainer: {
    position: "relative",
    height: 120,
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
  boostBadgeContainer: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cropType: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  quantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: theme.spacing.sm,
  },
  price: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  perUnit: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  location: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  farmerRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  farmerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  farmerName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  score: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  loadMoreButton: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  loadMoreText: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
});

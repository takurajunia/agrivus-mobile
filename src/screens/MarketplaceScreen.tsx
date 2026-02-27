import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, Filter, MapPin, Star, TrendingUp } from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { listingsService } from "../services/listingsService";
import type { ListingWithFarmer, ListingFilters } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import OptimizedImage from "../components/OptimizedImage";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicSearchBar,
  NeumorphicBadge,
  NeumorphicIconButton,
  NeumorphicButton,
} from "../components/neumorphic";

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

const BOOST_BANNER_HEIGHT = 58;

export default function MarketplaceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [listings, setListings] = useState<ListingWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const numColumns = width >= 1200 ? 4 : width >= 900 ? 3 : width >= 700 ? 2 : 1;
  const scrollY = useRef(new Animated.Value(0)).current;
  const bannerTravel = BOOST_BANNER_HEIGHT + spacing.md;

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const bannerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -bannerTravel],
    extrapolate: "clamp",
  });

  const listTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -bannerTravel],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const currentPage = filters.page || 1;
    fetchListings(filters, {
      append: currentPage > 1,
      showLoader: currentPage === 1,
      forceRefresh: refreshing,
    });
  }, [filters]);

  const fetchListings = async (
    activeFilters: ListingFilters,
    options?: {
      append?: boolean;
      showLoader?: boolean;
      forceRefresh?: boolean;
    }
  ) => {
    const append = options?.append ?? false;
    const showLoader = options?.showLoader ?? !append;

    try {
      if (showLoader) {
        setLoading(true);
      }
      setError("");
      const response = await listingsService.getListings(activeFilters, {
        forceRefresh: options?.forceRefresh,
      });

      if (response.success && response.data) {
        if (append) {
          setListings((previous) => {
            const seen = new Set(previous.map((entry) => entry.listing.id));
            const newItems = response.data!.listings.filter(
              (entry) => !seen.has(entry.listing.id)
            );
            return [...previous, ...newItems];
          });
        } else {
          setListings(response.data.listings);
        }
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
      if (append) {
        setLoadingMore(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setFilters((previous) => ({ ...previous, page: 1 }));
  };

  const handleLoadMore = () => {
    const currentPage = pagination.page || 1;
    const totalPages = pagination.totalPages || 1;

    if (loading || refreshing || loadingMore || currentPage >= totalPages) {
      return;
    }

    setLoadingMore(true);
    setFilters((previous) => ({ ...previous, page: (previous.page || 1) + 1 }));
  };

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const getListingDisplayName = (listing: ListingWithFarmer["listing"]) => {
    const cropType = listing.cropType?.trim();
    const cropName = listing.cropName?.trim();

    if (!cropType) {
      return cropName || "Crop";
    }

    if (!cropName) {
      return cropType;
    }

    if (cropType.toLowerCase() === cropName.toLowerCase()) {
      return cropType;
    }

    return `${cropType} (${cropName})`;
  };

  const renderListingCard = ({ item }: { item: ListingWithFarmer }) => {
    const { listing, farmer } = item;
    const boostMultiplier = farmer.boostMultiplier
      ? parseFloat(farmer.boostMultiplier)
      : 1;

    return (
      <NeumorphicCard
        style={styles.listingCard}
        onPress={() => router.push(`/listing/${listing.id}`)}
        variant="standard"
      >
        <View
          style={[
            styles.imageContainer,
            numColumns === 1
              ? styles.imageContainerSingleColumn
              : styles.imageContainerMultiColumn,
          ]}
        >
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
          {boostMultiplier > 1 && (
            <View style={styles.boostBadgeContainer}>
              <NeumorphicBadge
                label={`${boostMultiplier.toFixed(1)}x`}
                variant="success"
                size="small"
              />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cropType}>{getListingDisplayName(listing)}</Text>
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
            <MapPin size={14} color={neumorphicColors.text.secondary} />
            <Text style={styles.location}>{listing.location}</Text>
          </View>

          <View style={styles.farmerRow}>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{farmer.fullName}</Text>
              <View style={styles.scoreContainer}>
                <Star size={12} color={neumorphicColors.secondary[500]} />
                <Text style={styles.score}>{farmer.platformScore}</Text>
              </View>
            </View>
          </View>
        </View>
      </NeumorphicCard>
    );
  };

  return (
    <NeumorphicScreen variant="list" showLeaves={true}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>
          Browse agricultural products from verified farmers
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search products..."
          value={filters.search || ""}
          onChangeText={(text) => handleFilterChange("search", text)}
          style={styles.searchBar}
        />
        <NeumorphicIconButton
          icon={<Filter size={20} color={neumorphicColors.primary[600]} />}
          onPress={() => setShowFilters(!showFilters)}
          size="medium"
          variant={showFilters ? "primary" : "default"}
        />
      </View>

      {/* Filter Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTags}
        contentContainerStyle={styles.filterTagsContent}
      >
        {CROP_TYPES.map((crop) => {
          const isActive =
            filters.cropType === crop || (crop === "All" && !filters.cropType);
          return (
            <TouchableOpacity
              key={crop}
              style={[styles.filterTag, isActive && styles.filterTagActive]}
              onPress={() =>
                handleFilterChange(
                  "cropType",
                  crop === "All" ? undefined : crop
                )
              }
            >
              <Text
                style={[
                  styles.filterTagText,
                  isActive && styles.filterTagTextActive,
                ]}
              >
                {crop}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Boost Info Banner */}
      <Animated.View
        style={[
          styles.boostBannerContainer,
          {
            opacity: bannerOpacity,
            transform: [{ translateY: bannerTranslateY }],
          },
        ]}
      >
        <NeumorphicCard variant="glass" style={styles.boostBanner}>
          <TrendingUp size={20} color={neumorphicColors.primary[600]} />
          <Text style={styles.boostText}>
            Smart Ranking: Top sellers appear first
          </Text>
        </NeumorphicCard>
      </Animated.View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            variant="danger"
            size="small"
            onPress={() =>
              fetchListings(filters, {
                append: false,
                showLoader: true,
                forceRefresh: true,
              })
            }
          />
        </View>
      ) : null}

      {/* Listings */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.listWrapper,
            {
              transform: [{ translateY: listTranslateY }],
            },
          ]}
        >
          <Animated.FlatList
            key={`marketplace-columns-${numColumns}`}
            data={listings}
            renderItem={renderListingCard}
            keyExtractor={(item) => item.listing.id}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[neumorphicColors.primary[600]]}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator
                    size="small"
                    color={neumorphicColors.primary[600]}
                  />
                </View>
              ) : null
            }
          />
        </Animated.View>
      )}
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
  },
  filterTags: {
    marginTop: spacing.md,
    maxHeight: 44,
  },
  filterTagsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterTag: {
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
    alignItems: "center",
    justifyContent: "center",
    // Neumorphic shadow
    shadowColor: neumorphicColors.base.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTagActive: {
    backgroundColor: neumorphicColors.primary[700],
    borderColor: neumorphicColors.primary[700],
    shadowColor: neumorphicColors.primary[600],
  },
  filterTagText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0.1,
    color: neumorphicColors.text.primary,
  },
  filterTagTextActive: {
    color: neumorphicColors.text.inverse,
    fontWeight: "700",
  },
  boostBanner: {
    flexDirection: "row",
    alignItems: "center",
    height: BOOST_BANNER_HEIGHT,
    padding: spacing.md,
    gap: spacing.sm,
  },
  boostBannerContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  listWrapper: {
    flex: 1,
  },
  boostText: {
    ...typography.body,
    color: neumorphicColors.primary[700],
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMoreContainer: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: `${neumorphicColors.semantic.error}15`,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  errorText: {
    color: neumorphicColors.semantic.error,
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  listingCard: {
    flex: 1,
    overflow: "hidden",
    marginBottom: spacing.md,
    padding: 0,
  },
  imageContainer: {
    position: "relative",
  },
  imageContainerSingleColumn: {
    height: 190,
  },
  imageContainerMultiColumn: {
    height: 150,
  },
  listingImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  placeholderText: {
    fontSize: 40,
  },
  boostBadgeContainer: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  cropType: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  quantity: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.sm,
  },
  price: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
  },
  perUnit: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    flex: 1,
  },
  farmerRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.border,
  },
  farmerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  farmerName: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    flex: 1,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  score: {
    ...typography.caption,
    color: neumorphicColors.secondary[600],
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
});

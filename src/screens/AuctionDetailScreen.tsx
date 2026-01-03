import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  Gavel,
  MapPin,
  Package,
  User,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import { auctionsService } from "../services/auctionsService";
import type { AuctionDetailResponse, BidWithBidder } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

export default function AuctionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [auctionData, setAuctionData] = useState<AuctionDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchAuction();
    }
  }, [id]);

  useEffect(() => {
    if (auctionData?.auction) {
      const timer = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(auctionData.auction.endTime));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auctionData]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await auctionsService.getAuctionDetails(id!);
      setAuctionData(response.data);

      // Set default bid amount
      const auction = response.data.auction;
      const minBid = auction.currentPrice
        ? parseFloat(auction.currentPrice) +
          (parseFloat(auction.bidIncrement) || 10)
        : parseFloat(auction.startingPrice);
      setBidAmount(minBid.toString());
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load auction");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAuction();
  };

  const calculateTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handlePlaceBid = async () => {
    if (!auctionData?.auction || !bidAmount) return;

    const auction = auctionData.auction;
    const amount = parseFloat(bidAmount);
    const minBid = auction.currentPrice
      ? parseFloat(auction.currentPrice) +
        (parseFloat(auction.bidIncrement) || 10)
      : parseFloat(auction.startingPrice);

    if (amount < minBid) {
      setError(`Minimum bid is $${minBid.toLocaleString()}`);
      return;
    }

    try {
      setPlacingBid(true);
      setError("");
      await auctionsService.placeBid(auction.id, { bidAmount: amount });
      fetchAuction();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (error && !auctionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAuction}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!auctionData) return null;

  const { auction, listing, bids } = auctionData;
  const isActive = auction.status === "active" && timeRemaining !== "Ended";

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
        <Text style={styles.headerTitle}>Auction</Text>
        <View style={{ width: 40 }} />
      </View>

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
        {/* Image */}
        <View style={styles.imageContainer}>
          {listing?.images && listing.images.length > 0 ? (
            <Image
              source={{ uri: listing.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🌾</Text>
            </View>
          )}
          <View style={styles.statusOverlay}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isActive
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {isActive ? "LIVE" : auction.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Clock size={24} color={theme.colors.primary[600]} />
          <View style={styles.timerContent}>
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={styles.timerValue}>{timeRemaining}</Text>
          </View>
        </View>

        {/* Auction Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{listing?.cropType || "Auction"}</Text>

          <View style={styles.priceSection}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentPrice}>
                $
                {parseFloat(
                  auction.currentPrice || auction.startingPrice
                ).toLocaleString()}
              </Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Starting Price</Text>
              <Text style={styles.startingPrice}>
                ${parseFloat(auction.startingPrice).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Users size={18} color={theme.colors.primary[600]} />
              <Text style={styles.statValue}>{bids?.length || 0}</Text>
              <Text style={styles.statLabel}>Bids</Text>
            </View>
            <View style={styles.statItem}>
              <Package size={18} color={theme.colors.primary[600]} />
              <Text style={styles.statValue}>{listing?.quantity || 0}</Text>
              <Text style={styles.statLabel}>{listing?.unit || "kg"}</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>

            {listing?.location && (
              <View style={styles.detailRow}>
                <MapPin size={18} color={theme.colors.text.secondary} />
                <Text style={styles.detailText}>{listing.location}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Clock size={18} color={theme.colors.text.secondary} />
              <Text style={styles.detailText}>
                Ends: {formatDate(auction.endTime)}
              </Text>
            </View>

            {auction.bidIncrement && (
              <View style={styles.detailRow}>
                <TrendingUp size={18} color={theme.colors.text.secondary} />
                <Text style={styles.detailText}>
                  Min increment: $
                  {parseFloat(auction.bidIncrement).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {listing?.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}
        </View>

        {/* Recent Bids */}
        {bids && bids.length > 0 && (
          <AnimatedCard style={styles.bidsSection}>
            <Text style={styles.sectionTitle}>Recent Bids</Text>
            {bids.slice(0, 5).map((bidItem: BidWithBidder, index: number) => (
              <View
                key={bidItem.bid.id}
                style={[styles.bidItem, index === 0 && styles.highestBid]}
              >
                <View style={styles.bidUser}>
                  <View style={styles.bidAvatar}>
                    <User size={16} color={theme.colors.text.secondary} />
                  </View>
                  <View>
                    <Text style={styles.bidderName}>
                      {bidItem.bidder?.fullName || "Anonymous"}
                      {index === 0 && (
                        <Text style={styles.highestLabel}> (Highest)</Text>
                      )}
                    </Text>
                    <Text style={styles.bidTime}>
                      {formatDate(bidItem.bid.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bidAmount}>
                  ${parseFloat(bidItem.bid.bidAmount).toLocaleString()}
                </Text>
              </View>
            ))}
          </AnimatedCard>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bid Section */}
      {isActive && (
        <View style={styles.bidSection}>
          {error ? <Text style={styles.bidError}>{error}</Text> : null}
          <View style={styles.bidInputContainer}>
            <View style={styles.bidInputWrapper}>
              <DollarSign size={20} color={theme.colors.text.secondary} />
              <Text style={styles.bidInput}>{bidAmount}</Text>
            </View>
            <View style={styles.bidButtons}>
              <TouchableOpacity
                style={styles.decrementButton}
                onPress={() => {
                  const newAmount = Math.max(
                    parseFloat(bidAmount) -
                      (parseFloat(auction.bidIncrement) || 10),
                    parseFloat(auction.currentPrice || auction.startingPrice) +
                      (parseFloat(auction.bidIncrement) || 10)
                  );
                  setBidAmount(newAmount.toString());
                }}
              >
                <Text style={styles.decrementText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.incrementButton}
                onPress={() => {
                  const newAmount =
                    parseFloat(bidAmount) +
                    (parseFloat(auction.bidIncrement) || 10);
                  setBidAmount(newAmount.toString());
                }}
              >
                <Text style={styles.incrementText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.placeBidButton,
              placingBid && styles.placeBidButtonDisabled,
            ]}
            onPress={handlePlaceBid}
            disabled={placingBid}
          >
            <Gavel size={20} color={theme.colors.text.inverse} />
            <Text style={styles.placeBidText}>
              {placingBid ? "Placing Bid..." : "Place Bid"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  imageContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  image: {
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
  statusOverlay: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  timerContent: {
    flex: 1,
  },
  timerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  timerValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  infoSection: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  priceSection: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  currentPrice: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  startingPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  detailsSection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  descriptionSection: {
    marginTop: theme.spacing.xl,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  bidsSection: {
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  bidItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  highestBid: {
    backgroundColor: theme.colors.success + "10",
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  bidUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  bidAvatar: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  bidderName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  highestLabel: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bidTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  bidAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  bottomPadding: {
    height: theme.spacing["3xl"],
  },
  bidSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  bidError: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  bidInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  bidInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  bidInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  bidButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  decrementButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  decrementText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  incrementButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
  },
  incrementText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  placeBidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  placeBidButtonDisabled: {
    opacity: 0.7,
  },
  placeBidText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});

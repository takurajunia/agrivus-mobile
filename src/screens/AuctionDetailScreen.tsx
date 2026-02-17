import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
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
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";
import { auctionsService } from "../services/auctionsService";
import type { AuctionDetailResponse, BidWithBidder } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../components/neumorphic/NeumorphicIconButton";
import NeumorphicBadge from "../components/neumorphic/NeumorphicBadge";

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
      <NeumorphicScreen variant="detail">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  if (error && !auctionData) {
    return (
      <NeumorphicScreen variant="detail">
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={
              <ChevronLeft size={24} color={neumorphicColors.text.primary} />
            }
            onPress={() => router.back()}
            variant="default"
            size="medium"
          />
          <Text style={styles.headerTitle}>Auction Details</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            onPress={fetchAuction}
            variant="primary"
            size="medium"
          />
        </View>
      </NeumorphicScreen>
    );
  }

  if (!auctionData) return null;

  const { auction, listing, bids } = auctionData;
  const isActive = auction.status === "active" && timeRemaining !== "Ended";

  return (
    <NeumorphicScreen variant="detail" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ChevronLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <Text style={styles.headerTitle}>Auction</Text>
        <View style={{ width: 48 }} />
      </View>

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
            <NeumorphicBadge
              label={isActive ? "LIVE" : auction.status.toUpperCase()}
              variant={isActive ? "success" : "error"}
              size="small"
            />
          </View>
        </View>

        {/* Timer */}
        <NeumorphicCard style={styles.timerSection} variant="standard">
          <Clock size={24} color={neumorphicColors.primary[600]} />
          <View style={styles.timerContent}>
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={styles.timerValue}>{timeRemaining}</Text>
          </View>
        </NeumorphicCard>

        {/* Auction Info */}
        <NeumorphicCard style={styles.infoSection} variant="elevated">
          <Text style={styles.title}>{listing?.cropType || "Auction"}</Text>

          <View style={styles.priceSection}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentPrice}>
                $
                {parseFloat(
                  auction.currentPrice || auction.startingPrice
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Starting Price</Text>
              <Text style={styles.startingPrice}>
                ${parseFloat(auction.startingPrice).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Users size={18} color={neumorphicColors.primary[600]} />
              <Text style={styles.statValue}>{bids?.length || 0}</Text>
              <Text style={styles.statLabel}>Bids</Text>
            </View>
            <View style={styles.statItem}>
              <Package size={18} color={neumorphicColors.primary[600]} />
              <Text style={styles.statValue}>{listing?.quantity || 0}</Text>
              <Text style={styles.statLabel}>{listing?.unit || "kg"}</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>

            {listing?.location && (
              <View style={styles.detailRow}>
                <MapPin size={18} color={neumorphicColors.text.secondary} />
                <Text style={styles.detailText}>{listing.location}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Clock size={18} color={neumorphicColors.text.secondary} />
              <Text style={styles.detailText}>
                Ends: {formatDate(auction.endTime)}
              </Text>
            </View>

            {auction.bidIncrement && (
              <View style={styles.detailRow}>
                <TrendingUp size={18} color={neumorphicColors.text.secondary} />
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
        </NeumorphicCard>

        {/* Recent Bids */}
        {bids && bids.length > 0 && (
          <NeumorphicCard style={styles.bidsSection} variant="standard">
            <Text style={styles.sectionTitle}>Recent Bids</Text>
            {bids.slice(0, 5).map((bidItem: BidWithBidder, index: number) => (
              <View
                key={bidItem.bid.id}
                style={[styles.bidItem, index === 0 && styles.highestBid]}
              >
                <View style={styles.bidUser}>
                  <View style={styles.bidAvatar}>
                    <User size={16} color={neumorphicColors.text.secondary} />
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
          </NeumorphicCard>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bid Section */}
      {isActive && (
        <NeumorphicCard style={styles.bidSection} variant="elevated">
          {error ? <Text style={styles.bidError}>{error}</Text> : null}
          <View style={styles.bidInputContainer}>
            <View style={styles.bidInputWrapper}>
              <DollarSign size={20} color={neumorphicColors.text.secondary} />
              <Text style={styles.bidInput}>{bidAmount}</Text>
            </View>
            <View style={styles.bidButtons}>
              <NeumorphicIconButton
                icon={<Text style={styles.decrementText}>-</Text>}
                onPress={() => {
                  const newAmount = Math.max(
                    parseFloat(bidAmount) -
                      (parseFloat(auction.bidIncrement) || 10),
                    parseFloat(auction.currentPrice || auction.startingPrice) +
                      (parseFloat(auction.bidIncrement) || 10)
                  );
                  setBidAmount(newAmount.toString());
                }}
                variant="default"
                size="medium"
              />
              <NeumorphicIconButton
                icon={<Text style={styles.incrementText}>+</Text>}
                onPress={() => {
                  const newAmount =
                    parseFloat(bidAmount) +
                    (parseFloat(auction.bidIncrement) || 10);
                  setBidAmount(newAmount.toString());
                }}
                variant="primary"
                size="medium"
              />
            </View>
          </View>
          <NeumorphicButton
            title={placingBid ? "Placing Bid..." : "Place Bid"}
            onPress={handlePlaceBid}
            variant="primary"
            size="large"
            disabled={placingBid}
            loading={placingBid}
            icon={<Gavel size={20} color={neumorphicColors.text.inverse} />}
            fullWidth
          />
        </NeumorphicCard>
      )}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neumorphicColors.base.card,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.shadowDark + "20",
  },
  headerTitle: {
    ...typography.h5,
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
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 80,
  },
  statusOverlay: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  timerContent: {
    flex: 1,
  },
  timerLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  timerValue: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
  },
  infoSection: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
  },
  priceSection: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  currentPrice: {
    ...typography.h3,
    color: neumorphicColors.primary[600],
  },
  startingPrice: {
    ...typography.h5,
    color: neumorphicColors.text.secondary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    ...typography.body,
    fontWeight: "600",
  },
  statLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  detailsSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  descriptionSection: {
    marginTop: spacing.xl,
  },
  description: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    lineHeight: 24,
  },
  bidsSection: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  bidItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.shadowDark + "20",
  },
  highestBid: {
    backgroundColor: neumorphicColors.semantic.success + "10",
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  bidUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bidAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.background,
    justifyContent: "center",
    alignItems: "center",
  },
  bidderName: {
    ...typography.body,
    fontWeight: "500",
  },
  highestLabel: {
    color: neumorphicColors.semantic.success,
    fontWeight: "700",
  },
  bidTime: {
    ...typography.caption,
  },
  bidAmount: {
    ...typography.h5,
    fontWeight: "700",
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  bidSection: {
    padding: spacing.lg,
    margin: 0,
    borderRadius: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  bidError: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  bidInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bidInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bidInput: {
    flex: 1,
    ...typography.h5,
    fontWeight: "700",
  },
  bidButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  decrementText: {
    ...typography.h4,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  incrementText: {
    ...typography.h4,
    fontWeight: "700",
    color: neumorphicColors.text.inverse,
  },
});

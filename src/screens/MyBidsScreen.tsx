import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Gavel,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  DollarSign,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { auctionsService } from "../services/auctionsService";
import type { Bid } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicBadge from "../components/neumorphic/NeumorphicBadge";

interface BidWithAuction extends Bid {
  auction?: {
    id: string;
    status: string;
    endTime: string;
    currentPrice: string;
    listing?: {
      cropType: string;
      quantity: number;
      unit: string;
    };
  };
}

export default function MyBidsScreen() {
  const router = useRouter();
  const [bids, setBids] = useState<BidWithAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "winning" | "outbid" | "ended">(
    "all"
  );

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await auctionsService.getMyBids();
      setBids(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bids");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBids();
  };

  const getBidStatus = (bid: BidWithAuction) => {
    if (!bid.auction) return "unknown";

    const auctionEnded = new Date(bid.auction.endTime) < new Date();
    const isHighestBid = bid.bidAmount === bid.auction.currentPrice;

    if (auctionEnded && isHighestBid) return "won";
    if (auctionEnded && !isHighestBid) return "lost";
    if (isHighestBid) return "winning";
    return "outbid";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return neumorphicColors.semantic.success;
      case "winning":
        return neumorphicColors.primary[600];
      case "lost":
        return neumorphicColors.semantic.error;
      case "outbid":
        return neumorphicColors.semantic.warning;
      default:
        return neumorphicColors.text.secondary;
    }
  };

  const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" | "neutral" | "primary" => {
    switch (status) {
      case "won":
        return "success";
      case "winning":
        return "primary";
      case "lost":
        return "error";
      case "outbid":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
      case "winning":
        return TrendingUp;
      case "lost":
      case "outbid":
        return TrendingDown;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const filteredBids = bids.filter((bid) => {
    const status = getBidStatus(bid);
    if (filter === "all") return true;
    if (filter === "winning") return status === "winning" || status === "won";
    if (filter === "outbid") return status === "outbid";
    if (filter === "ended") return status === "won" || status === "lost";
    return true;
  });

  // Group bids by auction
  const groupedBids = filteredBids.reduce<Record<string, BidWithAuction[]>>(
    (acc, bid) => {
      const auctionId = bid.auctionId || "unknown";
      if (!acc[auctionId]) {
        acc[auctionId] = [];
      }
      acc[auctionId].push(bid);
      return acc;
    },
    {}
  );

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
        <Text style={styles.title}>My Bids</Text>
        <Text style={styles.subtitle}>
          {bids.length} bid{bids.length !== 1 ? "s" : ""} placed
        </Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filters}
      >
        {(["all", "winning", "outbid", "ended"] as const).map((f) => (
          <NeumorphicButton
            key={f}
            title={f.charAt(0).toUpperCase() + f.slice(1)}
            variant={filter === f ? "primary" : "secondary"}
            size="small"
            onPress={() => setFilter(f)}
            style={styles.filterButton}
          />
        ))}
      </ScrollView>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            variant="danger"
            size="small"
            onPress={fetchBids}
            style={styles.retryButton}
          />
        </View>
      ) : null}

      {/* Bids */}
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
        {filteredBids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Gavel size={64} color={neumorphicColors.text.tertiary} />
            <Text style={styles.emptyTitle}>No bids found</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Start bidding on auctions to see your bids here"
                : `No ${filter} bids at the moment`}
            </Text>
            <NeumorphicButton
              title="Browse Auctions"
              variant="primary"
              onPress={() => router.push("/auctions")}
              style={styles.browseButton}
            />
          </View>
        ) : (
          Object.entries(groupedBids).map(([auctionId, auctionBids]) => {
            const latestBid = auctionBids[0];
            const status = getBidStatus(latestBid);
            const StatusIcon = getStatusIcon(status);
            const statusColor = getStatusColor(status);
            const statusVariant = getStatusVariant(status);

            return (
              <NeumorphicCard
                key={auctionId}
                variant="elevated"
                style={styles.bidCard}
                onPress={() => router.push(`/auction/${auctionId}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.auctionInfo}>
                    <Text style={styles.cropType}>
                      {latestBid.auction?.listing?.cropType || "Auction"}
                    </Text>
                    <Text style={styles.quantity}>
                      {latestBid.auction?.listing?.quantity || 0}{" "}
                      {latestBid.auction?.listing?.unit || "kg"}
                    </Text>
                  </View>
                  <NeumorphicBadge
                    label={status.toUpperCase()}
                    variant={statusVariant}
                    size="small"
                    icon={<StatusIcon size={12} color={statusColor} />}
                  />
                </View>

                <View style={styles.bidInfo}>
                  <View style={styles.bidDetail}>
                    <DollarSign size={16} color={neumorphicColors.primary[600]} />
                    <View>
                      <Text style={styles.bidLabel}>Your Bid</Text>
                      <Text style={styles.bidValue}>
                        ${parseFloat(latestBid.bidAmount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bidDetail}>
                    <TrendingUp size={16} color={neumorphicColors.text.secondary} />
                    <View>
                      <Text style={styles.bidLabel}>Current Price</Text>
                      <Text style={styles.bidValue}>
                        $
                        {parseFloat(
                          latestBid.auction?.currentPrice || "0"
                        ).toLocaleString()}}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.timeInfo}>
                    <Clock size={14} color={neumorphicColors.text.tertiary} />
                    <Text style={styles.timeText}>
                      {latestBid.auction?.endTime
                        ? calculateTimeRemaining(latestBid.auction.endTime)
                        : "Unknown"}
                    </Text>
                  </View>
                  <View style={styles.viewAction}>
                    <Text style={styles.viewText}>View Auction</Text>
                    <ChevronRight size={16} color={neumorphicColors.primary[600]} />
                  </View>
                </View>

                {/* Bid History */}
                {auctionBids.length > 1 && (
                  <View style={styles.bidHistory}>
                    <Text style={styles.historyTitle}>
                      Bid History ({auctionBids.length} bids)
                    </Text>
                    {auctionBids.slice(0, 3).map((bid, index) => (
                      <View key={bid.id} style={styles.historyItem}>
                        <Text style={styles.historyAmount}>
                          ${parseFloat(bid.bidAmount).toLocaleString()}
                        </Text>
                        <Text style={styles.historyTime}>
                          {formatDate(bid.createdAt)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </NeumorphicCard>
            );
          })
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
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    marginRight: spacing.xs,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: neumorphicColors.badge.error.bg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  errorText: {
    color: neumorphicColors.semantic.error,
    ...typography.bodySmall,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  browseButton: {
    marginTop: spacing.xl,
  },
  bidCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  auctionInfo: {},
  cropType: {
    ...typography.h5,
  },
  quantity: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  bidInfo: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  bidDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bidLabel: {
    ...typography.caption,
  },
  bidValue: {
    ...typography.h6,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  timeText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  viewAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewText: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.primary[600],
  },
  bidHistory: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  historyTitle: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  historyAmount: {
    ...typography.bodySmall,
    color: neumorphicColors.text.primary,
  },
  historyTime: {
    ...typography.caption,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import { theme } from "../theme/tokens";
import { auctionsService } from "../services/auctionsService";
import type { Bid } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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
        return theme.colors.success;
      case "winning":
        return theme.colors.primary[600];
      case "lost":
        return theme.colors.error;
      case "outbid":
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
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
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBids}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
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
            colors={[theme.colors.primary[600]]}
          />
        }
      >
        {filteredBids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Gavel size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No bids found</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Start bidding on auctions to see your bids here"
                : `No ${filter} bids at the moment`}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/auctions")}
            >
              <Text style={styles.browseButtonText}>Browse Auctions</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(groupedBids).map(([auctionId, auctionBids]) => {
            const latestBid = auctionBids[0];
            const status = getBidStatus(latestBid);
            const StatusIcon = getStatusIcon(status);
            const statusColor = getStatusColor(status);

            return (
              <AnimatedCard
                key={auctionId}
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
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor + "20" },
                    ]}
                  >
                    <StatusIcon size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.bidInfo}>
                  <View style={styles.bidDetail}>
                    <DollarSign size={16} color={theme.colors.primary[600]} />
                    <View>
                      <Text style={styles.bidLabel}>Your Bid</Text>
                      <Text style={styles.bidValue}>
                        ${parseFloat(latestBid.bidAmount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bidDetail}>
                    <TrendingUp size={16} color={theme.colors.text.secondary} />
                    <View>
                      <Text style={styles.bidLabel}>Current Price</Text>
                      <Text style={styles.bidValue}>
                        $
                        {parseFloat(
                          latestBid.auction?.currentPrice || "0"
                        ).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.timeInfo}>
                    <Clock size={14} color={theme.colors.text.tertiary} />
                    <Text style={styles.timeText}>
                      {latestBid.auction?.endTime
                        ? calculateTimeRemaining(latestBid.auction.endTime)
                        : "Unknown"}
                    </Text>
                  </View>
                  <View style={styles.viewAction}>
                    <Text style={styles.viewText}>View Auction</Text>
                    <ChevronRight size={16} color={theme.colors.primary[600]} />
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
              </AnimatedCard>
            );
          })
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
  filtersContainer: {
    maxHeight: 50,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: theme.colors.text.inverse,
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
    paddingTop: theme.spacing.md,
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
  browseButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
  },
  browseButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
  },
  bidCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  auctionInfo: {},
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bidInfo: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  bidDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  bidLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  bidValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  viewAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  },
  bidHistory: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  historyTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.xs,
  },
  historyAmount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  historyTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  bottomPadding: {
    height: theme.spacing["3xl"],
  },
});

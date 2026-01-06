import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Gavel, Clock, TrendingUp, Plus, Users } from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { auctionsService } from "../services/auctionsService";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicBadge,
  NeumorphicIconButton,
  NeumorphicButton,
} from "../components/neumorphic";

interface AuctionItem {
  auction: {
    id: string;
    currentPrice: string;
    startingPrice: string;
    reservePrice: string | null;
    endTime: string;
    totalBids: number;
    status: string;
  };
  listing: {
    id: string;
    cropType: string;
    quantity: string;
    unit: string;
    location: string;
    images?: string[];
  };
  bidCount: number;
}

export default function AuctionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await auctionsService.getLiveAuctions();
      setAuctions(response.data?.auctions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch auctions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAuctions();
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const renderAuctionCard = ({ item }: { item: AuctionItem }) => {
    const { auction, listing, bidCount } = item;
    const timeRemaining = getTimeRemaining(auction.endTime);
    const isEnding =
      timeRemaining.includes("m left") && !timeRemaining.includes("h");

    return (
      <NeumorphicCard
        style={styles.auctionCard}
        onPress={() => router.push(`/auction/${auction.id}`)}
        variant="elevated"
      >
        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>
              {listing.cropType?.charAt(0) || "🌾"}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cropType}>{listing.cropType || "Crop"}</Text>
          <Text style={styles.quantity}>
            {listing.quantity} {listing.unit}
          </Text>
          <Text style={styles.location}>📍 {listing.location}</Text>

          {/* Price Info */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Current Bid:</Text>
              <Text style={styles.currentPrice}>
                ${parseFloat(auction.currentPrice).toLocaleString()}
              </Text>
            </View>
            {auction.reservePrice && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Reserve:</Text>
                <Text style={styles.reservePrice}>
                  ${parseFloat(auction.reservePrice).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Users size={14} color={neumorphicColors.text.secondary} />
              <Text style={styles.statText}>{bidCount || 0} bids</Text>
            </View>
            <View style={[styles.stat, isEnding && styles.endingSoon]}>
              <Clock
                size={14}
                color={
                  isEnding
                    ? neumorphicColors.semantic.error
                    : neumorphicColors.text.secondary
                }
              />
              <Text
                style={[styles.statText, isEnding && styles.endingSoonText]}
              >
                {timeRemaining}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <NeumorphicButton
            title="View & Bid"
            variant="secondary"
            onPress={() => router.push(`/auction/${auction.id}`)}
            fullWidth
            style={styles.bidButton}
          />
        </View>
      </NeumorphicCard>
    );
  };

  return (
    <NeumorphicScreen variant="list" showLeaves={true}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔥 Live Auctions</Text>
          <Text style={styles.subtitle}>
            Bid on fresh produce from local farmers
          </Text>
        </View>
        {user?.role === "farmer" && (
          <NeumorphicIconButton
            icon={<Plus size={20} color={neumorphicColors.text.inverse} />}
            onPress={() => router.push("/create-auction")}
            variant="primary"
            size="medium"
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <NeumorphicCard
          style={styles.actionButton}
          onPress={() => router.push("/my-bids")}
          variant="standard"
        >
          <View style={styles.actionButtonContent}>
            <Gavel size={18} color={neumorphicColors.primary[600]} />
            <Text style={styles.actionText}>My Bids</Text>
          </View>
        </NeumorphicCard>
        <NeumorphicCard
          style={styles.actionButton}
          onPress={() => router.push("/marketplace")}
          variant="standard"
        >
          <View style={styles.actionButtonContent}>
            <TrendingUp size={18} color={neumorphicColors.primary[600]} />
            <Text style={styles.actionText}>Marketplace</Text>
          </View>
        </NeumorphicCard>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            variant="danger"
            size="small"
            onPress={fetchAuctions}
          />
        </View>
      ) : null}

      {/* Auctions List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={auctions}
          renderItem={renderAuctionCard}
          keyExtractor={(item) => item.auction.id}
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
              <Text style={styles.emptyIcon}>🔨</Text>
              <Text style={styles.emptyTitle}>No live auctions</Text>
              <Text style={styles.emptyText}>
                Check back later for new auctions
              </Text>
              <NeumorphicButton
                title="Browse Marketplace"
                variant="primary"
                onPress={() => router.push("/marketplace")}
              />
            </View>
          }
        />
      )}
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.md,
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
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  actionText: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.primary[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
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
    paddingTop: 0,
  },
  auctionCard: {
    overflow: "hidden",
    marginBottom: spacing.md,
    padding: 0,
  },
  liveBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: neumorphicColors.semantic.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: neumorphicColors.text.inverse,
  },
  liveText: {
    ...typography.caption,
    fontWeight: "700",
    color: neumorphicColors.text.inverse,
  },
  imageContainer: {
    height: 150,
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
    fontSize: 56,
  },
  cardContent: {
    padding: spacing.lg,
  },
  cropType: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  quantity: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  location: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  priceContainer: {
    backgroundColor: `${neumorphicColors.primary[500]}10`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  priceLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  currentPrice: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
  },
  reservePrice: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  endingSoon: {
    backgroundColor: `${neumorphicColors.semantic.error}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  endingSoonText: {
    color: neumorphicColors.semantic.error,
    fontWeight: "600",
  },
  bidButton: {
    marginTop: spacing.md,
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
    marginBottom: spacing.lg,
  },
});

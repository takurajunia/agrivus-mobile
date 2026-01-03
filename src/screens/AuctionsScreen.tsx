import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Gavel, Clock, TrendingUp, Plus, Users } from "lucide-react-native";
import { theme } from "../theme/tokens";
import { auctionsService } from "../services/auctionsService";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";
import { useAuth } from "../contexts/AuthContext";

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
      <AnimatedCard
        style={styles.auctionCard}
        onPress={() => router.push(`/auction/${auction.id}`)}
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
              <Users size={14} color={theme.colors.text.secondary} />
              <Text style={styles.statText}>{bidCount || 0} bids</Text>
            </View>
            <View style={[styles.stat, isEnding && styles.endingSoon]}>
              <Clock
                size={14}
                color={
                  isEnding ? theme.colors.error : theme.colors.text.secondary
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
          <TouchableOpacity style={styles.bidButton}>
            <Text style={styles.bidButtonText}>View & Bid</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔥 Live Auctions</Text>
          <Text style={styles.subtitle}>
            Bid on fresh produce from local farmers
          </Text>
        </View>
        {user?.role === "farmer" && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-auction")}
          >
            <Plus size={20} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/my-bids")}
        >
          <Gavel size={18} color={theme.colors.primary[600]} />
          <Text style={styles.actionText}>My Bids</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/marketplace")}
        >
          <TrendingUp size={18} color={theme.colors.primary[600]} />
          <Text style={styles.actionText}>Marketplace</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAuctions}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
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
              colors={[theme.colors.primary[600]]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔨</Text>
              <Text style={styles.emptyTitle}>No live auctions</Text>
              <Text style={styles.emptyText}>
                Check back later for new auctions
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/marketplace")}
              >
                <Text style={styles.browseButtonText}>Browse Marketplace</Text>
              </TouchableOpacity>
            </View>
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
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
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
    paddingTop: 0,
  },
  auctionCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  liveBadge: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    zIndex: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.inverse,
  },
  liveText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  imageContainer: {
    height: 150,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 56,
  },
  cardContent: {
    padding: theme.spacing.lg,
  },
  cropType: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  quantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  location: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  priceContainer: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  currentPrice: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  reservePrice: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  endingSoon: {
    backgroundColor: theme.colors.error + "15",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  endingSoonText: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bidButton: {
    backgroundColor: theme.colors.secondary[500],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  bidButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
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
    marginBottom: theme.spacing.lg,
  },
  browseButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  browseButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

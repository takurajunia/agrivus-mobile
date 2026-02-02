import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TransportOffer {
  offerId: string;
  orderId: string;
  pickupLocation: string;
  deliveryLocation: string;
  transportCost: string;
  status: "pending" | "accepted" | "declined" | "countered";
  tier: "primary" | "secondary" | "tertiary";
  isActive: boolean;
  offeredAt: string;
  respondedAt?: string;
  counterFee?: string;
  counteredAt?: string;
  sentToPrimaryAt: string;
  sentToSecondaryAt?: string;
  sentToTertiaryAt?: string;
  farmer: {
    id: string;
    fullName: string;
    phone: string;
  };
  listing?: {
    name: string;
    location: string;
  };
}

export const TransportOffersMobile: React.FC<{
  defaultStatus?: "pending" | "accepted" | "declined" | "countered";
}> = ({ defaultStatus = "pending" }) => {
  const [offers, setOffers] = useState<TransportOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "accepted" | "declined" | "countered"
  >(defaultStatus);
  const [actingOnOfferId, setActingOnOfferId] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
    // Refresh every 30 seconds
    const interval = setInterval(loadOffers, 30000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const loadOffers = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      // Call getTransporterOffers endpoint
      // const response = await ordersService.getTransporterOffers(selectedStatus);
      // setOffers(response.data?.offers || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transport offers",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOffers();
  };

  const handleCounter = (offerId: string) => {
    Alert.prompt(
      "Counter Fee (KES)",
      "Enter your proposed fee:",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Send",
          onPress: async (input: string | undefined) => {
            if (!input) {
              Alert.alert("Error", "Please enter a fee amount");
              return;
            }
            const fee = parseFloat(input);
            if (Number.isNaN(fee)) {
              Alert.alert("Error", "Invalid fee amount");
              return;
            }
            try {
              setActingOnOfferId(offerId);
              // await ordersService.counterTransportOffer(offerId, fee);
              Alert.alert("Success", "Counter offer sent!");
              setTimeout(() => loadOffers(), 1000);
            } catch (err) {
              Alert.alert(
                "Error",
                err instanceof Error ? err.message : "Failed to counter offer",
              );
            } finally {
              setActingOnOfferId(null);
            }
          },
        },
      ],
      "plain-text",
      "",
      "decimal-pad",
    );
  };

  const handleAccept = async (offerId: string) => {
    try {
      setActingOnOfferId(offerId);
      // Call acceptTransportOffer endpoint
      // await ordersService.acceptTransportOffer(offerId);
      Alert.alert(
        "Success!",
        "Transport offer accepted! You've earned +3 platform score.",
      );
      setTimeout(() => {
        loadOffers();
      }, 1000);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to accept offer",
      );
      setActingOnOfferId(null);
    }
  };

  const handleDecline = async (offerId: string) => {
    Alert.prompt(
      "Decline Offer",
      "Would you like to provide a reason? (optional)",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Decline",
          onPress: async (reason: string | undefined) => {
            try {
              setActingOnOfferId(offerId);
              // Call declineTransportOffer endpoint
              // await ordersService.declineTransportOffer(offerId, reason);
              setTimeout(() => {
                loadOffers();
              }, 1000);
            } catch (err) {
              Alert.alert(
                "Error",
                err instanceof Error ? err.message : "Failed to decline offer",
              );
              setActingOnOfferId(null);
            }
          },
        },
      ],
    );
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "primary":
        return { bg: "#f0fdf4", border: "#22c55e", label: "🚀 Tier 1" };
      case "secondary":
        return { bg: "#eff6ff", border: "#3b82f6", label: "⏰ Tier 2" };
      case "tertiary":
        return { bg: "#faf5ff", border: "#a855f7", label: "🎯 Tier 3" };
      default:
        return { bg: "#f3f4f6", border: "#9ca3af", label: tier };
    }
  };

  const getTimeRemaining = (sentAt: string, isActive: boolean): string => {
    if (!isActive) return "Waiting...";

    const sent = new Date(sentAt);
    const oneHourLater = new Date(sent.getTime() + 60 * 60 * 1000);
    const now = new Date();

    if (now >= oneHourLater) {
      return "Time expired (other tiers active)";
    }

    const minutesRemaining = Math.floor(
      (oneHourLater.getTime() - now.getTime()) / (1000 * 60),
    );
    return `${minutesRemaining}m remaining`;
  };

  if (loading && offers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transport Offers</Text>
          <Text style={styles.headerSubtitle}>
            Manage your offers and earn +3 score
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading transport offers...</Text>
        </View>
      </View>
    );
  }

  const pendingOffers = offers.filter((o) => o.status === "pending");
  const acceptedOffers = offers.filter((o) => o.status === "accepted");
  const counteredOffers = offers.filter((o) => o.status === "countered");
  const declinedOffers = offers.filter((o) => o.status === "declined");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transport Offers</Text>
        <Text style={styles.headerSubtitle}>
          Manage your offers and earn +3 score
        </Text>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedStatus === "pending" && styles.activeTab]}
          onPress={() => setSelectedStatus("pending")}
        >
          <Text
            style={[
              styles.tabText,
              selectedStatus === "pending" && styles.activeTabText,
            ]}
          >
            📋 Pending ({pendingOffers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedStatus === "accepted" && styles.activeTab,
          ]}
          onPress={() => setSelectedStatus("accepted")}
        >
          <Text
            style={[
              styles.tabText,
              selectedStatus === "accepted" && styles.activeTabText,
            ]}
          >
            ✅ Accepted ({acceptedOffers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedStatus === "countered" && styles.activeTab,
          ]}
          onPress={() => setSelectedStatus("countered")}
        >
          <Text
            style={[
              styles.tabText,
              selectedStatus === "countered" && styles.activeTabText,
            ]}
          >
            💬 Countered ({counteredOffers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedStatus === "declined" && styles.activeTab,
          ]}
          onPress={() => setSelectedStatus("declined")}
        >
          <Text
            style={[
              styles.tabText,
              selectedStatus === "declined" && styles.activeTabText,
            ]}
          >
            ❌ Declined ({declinedOffers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle"
            size={20}
            color="#dc2626"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#22c55e"
            />
          }
        >
          <Ionicons name="time" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>
            {selectedStatus === "pending"
              ? "No pending offers"
              : selectedStatus === "accepted"
                ? "No accepted offers yet"
                : selectedStatus === "countered"
                  ? "No countered offers"
                  : "No declined offers"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedStatus === "pending"
              ? "Check back soon for new transport opportunities"
              : "Your offers will appear here"}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.offersList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#22c55e"
            />
          }
        >
          {offers.map((offer) => {
            const tierInfo = getTierColor(offer.tier);

            return (
              <View
                key={offer.offerId}
                style={[
                  styles.offerCard,
                  {
                    backgroundColor: tierInfo.bg,
                    borderColor: tierInfo.border,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.offerHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgesRow}>
                      <View
                        style={[
                          styles.tierBadge,
                          { borderColor: tierInfo.border },
                        ]}
                      >
                        <Text style={styles.tierBadgeText}>
                          {tierInfo.label}
                        </Text>
                      </View>

                      {offer.isActive && offer.status === "pending" && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>⭐ Active</Text>
                        </View>
                      )}

                      {offer.status === "accepted" && (
                        <View style={styles.acceptedBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#22c55e"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.acceptedBadgeText}>Accepted</Text>
                        </View>
                      )}

                      {offer.status === "countered" && (
                        <View style={styles.counteredBadge}>
                          <Ionicons
                            name="chatbubble"
                            size={14}
                            color="#f59e0b"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.counteredBadgeText}>
                            Countered
                          </Text>
                        </View>
                      )}

                      {offer.status === "declined" && (
                        <View style={styles.declinedBadge}>
                          <Ionicons
                            name="close-circle"
                            size={14}
                            color="#dc2626"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.declinedBadgeText}>Declined</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.offerTitle}>
                      {offer.listing?.name || "Transport Offer"}
                    </Text>
                    <Text style={styles.orderId}>
                      Order: {offer.orderId.substring(0, 8)}
                    </Text>
                  </View>

                  <View style={styles.costBox}>
                    <Text style={styles.costValue}>
                      KES {parseFloat(offer.transportCost).toLocaleString()}
                    </Text>
                    <Text style={styles.costLabel}>Transport</Text>
                  </View>
                </View>

                {/* Active Timer */}
                {offer.status === "pending" && (
                  <View style={styles.timerBox}>
                    <Text
                      style={[
                        styles.timerText,
                        {
                          color: offer.isActive ? "#22c55e" : "#6b7280",
                        },
                      ]}
                    >
                      {offer.isActive
                        ? "⏱️ " +
                          getTimeRemaining(
                            offer.sentToPrimaryAt,
                            offer.tier === "primary",
                          )
                        : "🕐 Waiting for your tier..."}
                    </Text>
                  </View>
                )}

                {/* Locations */}
                <View style={styles.locationBox}>
                  <View style={styles.locationItem}>
                    <Ionicons
                      name="location"
                      size={18}
                      color="#2563eb"
                      style={{ marginRight: 8 }}
                    />
                    <View>
                      <Text style={styles.locationLabel}>Pickup</Text>
                      <Text style={styles.locationText}>
                        {offer.pickupLocation}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.locationItem}>
                    <Ionicons
                      name="location"
                      size={18}
                      color="#dc2626"
                      style={{ marginRight: 8 }}
                    />
                    <View>
                      <Text style={styles.locationLabel}>Delivery</Text>
                      <Text style={styles.locationText}>
                        {offer.deliveryLocation}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Farmer Info */}
                <View style={styles.farmerBox}>
                  <Text style={styles.farmerLabel}>Farmer</Text>
                  <Text style={styles.farmerName}>{offer.farmer.fullName}</Text>
                  <Text style={styles.farmerPhone}>{offer.farmer.phone}</Text>
                </View>

                {/* Actions */}
                {offer.status === "pending" && offer.isActive && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAccept(offer.offerId)}
                      disabled={actingOnOfferId === offer.offerId}
                    >
                      {actingOnOfferId === offer.offerId ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#ffffff"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => handleCounter(offer.offerId)}
                      disabled={actingOnOfferId === offer.offerId}
                    >
                      {actingOnOfferId === offer.offerId ? (
                        <ActivityIndicator color="#f59e0b" size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name="chatbubble"
                            size={18}
                            color="#f59e0b"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.counterButtonText}>Counter</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDecline(offer.offerId)}
                      disabled={actingOnOfferId === offer.offerId}
                    >
                      {actingOnOfferId === offer.offerId ? (
                        <ActivityIndicator color="#dc2626" size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color="#dc2626"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.declineButtonText}>Decline</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Completed Status */}
                {offer.status !== "pending" && (
                  <View style={styles.completedBox}>
                    <Text style={styles.completedStatus}>
                      {offer.status === "accepted"
                        ? "✅ Offer Accepted"
                        : offer.status === "countered"
                          ? `💬 Counter Proposed - KES ${parseFloat(offer.counterFee || "0").toLocaleString()}`
                          : "❌ Offer Declined"}
                    </Text>
                    {offer.respondedAt && (
                      <Text style={styles.completedDate}>
                        {new Date(offer.respondedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* Info Box */}
          {selectedStatus === "pending" && (
            <View style={styles.infoBox}>
              <Ionicons
                name="trending-up"
                size={20}
                color="#2563eb"
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Earn +3 Platform Score</Text>
                <Text style={styles.infoText}>
                  Accept any offer to boost your platform score and increase
                  visibility in future matches!
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#15803d",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#dcfce7",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  activeTab: {
    backgroundColor: "#22c55e",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  activeTabText: {
    color: "#ffffff",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
  },
  offersList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  offerCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  tierBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  activeBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400e",
  },
  acceptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  acceptedBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#166534",
  },
  declinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  declinedBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7f1d1d",
  },
  counteredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  counteredBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400e",
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  orderId: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  costBox: {
    alignItems: "flex-end",
  },
  costValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  costLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  timerBox: {
    marginBottom: 12,
  },
  timerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  locationBox: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  divider: {
    height: 12,
  },
  locationLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  farmerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  farmerLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  farmerPhone: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 10,
  },
  acceptButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  counterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 8,
    paddingVertical: 10,
  },
  counterButtonText: {
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: 14,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 10,
  },
  declineButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  completedBox: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  completedStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  completedDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#374151",
  },
});

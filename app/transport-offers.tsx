import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import NeumorphicCard from "../src/components/neumorphic/NeumorphicCard";
import {
  neumorphicColors,
  borderRadius,
  spacing,
  typography,
} from "../src/theme/neumorphic";
import ordersService from "../src/services/ordersService";
import LoadingSpinner from "../src/components/LoadingSpinner";

interface TransportOffer {
  offerId: string;
  orderId: string;
  pickupLocation: string;
  deliveryLocation: string;
  transportCost: string;
  counterFee?: string | null;
  counteredAt?: string;
  status: "pending" | "accepted" | "declined";
  tier: "primary" | "secondary" | "tertiary";
  isActive: boolean;
  offeredAt: string;
  respondedAt?: string;
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

export default function TransportOffersScreen() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<TransportOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "pending" | "accepted" | "declined"
  >("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (user?.role !== "transporter") return;
    try {
      setLoading(true);
      const response = await ordersService.getTransportOffers(activeFilter);
      if (response.success) {
        setOffers(response.data.offers);
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      Alert.alert("Error", "Failed to load transport offers");
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter]);

  React.useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setActionLoading(offerId);
      const response = await ordersService.acceptTransportOffer(offerId);
      if (response.success) {
        Alert.alert(
          "Success",
          "Offer accepted! You have been assigned to this order.",
        );
        fetchOffers();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to accept offer");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      setActionLoading(offerId);
      const response = await ordersService.declineTransportOffer(
        offerId,
        declineReason,
      );
      if (response.success) {
        Alert.alert("Success", "Offer declined");
        setShowDeclineModal(null);
        setDeclineReason("");
        fetchOffers();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to decline offer");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (user?.role !== "transporter") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>This page is only for transporters</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚚 Transport Offers</Text>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["pending", "accepted", "declined"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter && styles.filterTabTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.content}
      >
        {offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeFilter === "pending"
                ? "No pending offers"
                : `No ${activeFilter} offers`}
            </Text>
          </View>
        ) : (
          offers.map((offer) => (
            <NeumorphicCard
              key={offer.offerId}
              style={styles.offerCard}
              variant="elevated"
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerTitleContainer}>
                  <Text style={styles.offerTitle}>
                    {offer.listing?.name || "Order"}
                  </Text>
                  <Text style={styles.farmerName}>{offer.farmer.fullName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    offer.status === "pending" && styles.statusBadgePending,
                    offer.status === "accepted" && styles.statusBadgeAccepted,
                    offer.status === "declined" && styles.statusBadgeDeclined,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      offer.status === "pending" &&
                        styles.statusBadgeTextPending,
                      offer.status === "accepted" &&
                        styles.statusBadgeTextAccepted,
                      offer.status === "declined" &&
                        styles.statusBadgeTextDeclined,
                    ]}
                  >
                    {offer.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.locationsContainer}>
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>📍 PICKUP</Text>
                  <Text style={styles.locationText}>
                    {offer.pickupLocation}
                  </Text>
                </View>
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>🏠 DELIVERY</Text>
                  <Text style={styles.locationText}>
                    {offer.deliveryLocation}
                  </Text>
                </View>
              </View>

              <View style={styles.costContainer}>
                <View>
                  <Text style={styles.costLabel}>TRANSPORT COST</Text>
                  <Text style={styles.costAmount}>
                    ${parseFloat(offer.transportCost).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.contactContainer}>
                  <Text style={styles.costLabel}>CONTACT</Text>
                  <Text style={styles.contactPhone}>{offer.farmer.phone}</Text>
                </View>
              </View>

              {/* Tier Badge */}
              <View style={styles.tierBadgeContainer}>
                <Text style={[
                  styles.tierBadge,
                  offer.tier === 'primary' && styles.tierPrimary,
                  offer.tier === 'secondary' && styles.tierSecondary,
                  offer.tier === 'tertiary' && styles.tierTertiary,
                ]}>
                  {offer.tier === 'primary' ? '⭐ Priority Tier 1' : 
                   offer.tier === 'secondary' ? '🥈 Tier 2' : '🥉 Tier 3'}
                  {offer.isActive && ' - YOUR TURN'}
                </Text>
              </View>

              {/* Inactive message */}
              {!offer.isActive && offer.status === "pending" && (
                <View style={styles.inactiveMessage}>
                  <Text style={styles.inactiveMessageText}>
                    ⏳ This offer is currently with a higher priority transporter. You'll be notified if they decline.
                  </Text>
                </View>
              )}

              {/* Action buttons - only if active */}
              {offer.status === "pending" && offer.isActive && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAcceptOffer(offer.offerId)}
                    disabled={actionLoading !== null}
                  >
                    <Text style={styles.acceptButtonText}>✅ ACCEPT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.declineButton]}
                    onPress={() => setShowDeclineModal(offer.offerId)}
                    disabled={actionLoading !== null}
                  >
                    <Text style={styles.declineButtonText}>❌ DECLINE</Text>
                  </TouchableOpacity>
                </View>
              )}

              {offer.status === "accepted" && (
                <View style={styles.statusMessage}>
                  <Text style={styles.statusMessageText}>
                    ✅ You accepted this offer. It's now assigned to you.
                  </Text>
                </View>
              )}

              {offer.status === "declined" && (
                <View style={styles.statusMessageDeclined}>
                  <Text style={styles.statusMessageDeclinedText}>
                    You declined this offer
                  </Text>
                </View>
              )}
            </NeumorphicCard>
          ))
        )}
      </ScrollView>

      {/* Decline Modal */}
      <Modal
        visible={showDeclineModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeclineModal(null)}
      >
        <View style={styles.modalOverlay}>
          <NeumorphicCard style={styles.modalContent} variant="elevated">
            <Text style={styles.modalTitle}>Decline Offer</Text>
            <Text style={styles.modalSubtitle}>
              Please tell us why (optional):
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="e.g., Vehicle at capacity..."
              placeholderTextColor={neumorphicColors.text.tertiary}
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeclineModal(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={() => handleDeclineOffer(showDeclineModal!)}
                disabled={actionLoading !== null}
              >
                <Text style={styles.submitButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </NeumorphicCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: neumorphicColors.base.input,
    borderWidth: 1,
    borderColor: neumorphicColors.base.pressed,
  },
  filterTabActive: {
    backgroundColor: neumorphicColors.primary[600],
    borderColor: neumorphicColors.primary[600],
  },
  filterTabText: {
    fontSize: 12,
    lineHeight: 18,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: neumorphicColors.base.card,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.bodyLarge,
    color: neumorphicColors.text.secondary,
  },
  offerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  offerTitleContainer: {
    flex: 1,
  },
  offerTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  farmerName: {
    fontSize: 12,
    lineHeight: 18,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgePending: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeAccepted: {
    backgroundColor: "#DBEAFE",
  },
  statusBadgeDeclined: {
    backgroundColor: "#FECACA",
  },
  statusBadgeText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
  statusBadgeTextPending: {
    color: "#B45309",
  },
  statusBadgeTextAccepted: {
    color: "#1E40AF",
  },
  statusBadgeTextDeclined: {
    color: "#DC2626",
  },
  locationsContainer: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  locationItem: {
    marginBottom: spacing.sm,
  },
  locationLabel: {
    fontSize: 11,
    lineHeight: 16,
    color: neumorphicColors.text.tertiary,
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: 12,
    lineHeight: 18,
    color: neumorphicColors.text.primary,
    fontWeight: "600",
  },
  costContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  costLabel: {
    fontSize: 11,
    lineHeight: 16,
    color: neumorphicColors.text.tertiary,
    marginBottom: spacing.xs,
  },
  costAmount: {
    ...typography.h3,
    color: neumorphicColors.semantic.success,
  },
  contactContainer: {
    alignItems: "flex-end",
  },
  contactPhone: {
    fontSize: 12,
    lineHeight: 18,
    color: neumorphicColors.text.primary,
    fontWeight: "600",
  },
  tierBadgeContainer: {
    marginBottom: spacing.md,
  },
  tierBadge: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  tierPrimary: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    borderColor: "#FCD34D",
  },
  tierSecondary: {
    backgroundColor: "#DBEAFE",
    color: "#1E3A8A",
    borderColor: "#93C5FD",
  },
  tierTertiary: {
    backgroundColor: "#E9D5FF",
    color: "#581C87",
    borderColor: "#C084FC",
  },
  inactiveMessage: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inactiveMessageText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#1E3A8A",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: neumorphicColors.semantic.success,
  },
  acceptButtonText: {
    color: neumorphicColors.base.card,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: neumorphicColors.semantic.error,
  },
  declineButtonText: {
    color: neumorphicColors.base.card,
    fontWeight: "600",
  },
  statusMessage: {
    backgroundColor: "#DBEAFE",
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statusMessageText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#1E40AF",
  },
  statusMessageDeclined: {
    backgroundColor: "#F3F4F6",
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statusMessageDeclinedText: {
    fontSize: 12,
    lineHeight: 18,
    color: neumorphicColors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    padding: spacing.lg,
    width: "100%",
  },
  modalTitle: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    ...typography.bodyLarge,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: neumorphicColors.base.pressed,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    marginBottom: spacing.lg,
    color: neumorphicColors.text.primary,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: neumorphicColors.base.input,
    borderWidth: 1,
    borderColor: neumorphicColors.base.pressed,
  },
  cancelButtonText: {
    color: neumorphicColors.text.primary,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: neumorphicColors.primary[600],
  },
  submitButtonText: {
    color: neumorphicColors.base.card,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    ...typography.bodyLarge,
    color: neumorphicColors.semantic.error,
    textAlign: "center",
  },
});

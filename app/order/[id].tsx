import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertCircle,
  MessageCircle,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../src/components/neumorphic";
import ordersService, {
  OrderWithDetails,
} from "../../src/services/ordersService";
import { useAuth } from "../../src/contexts/AuthContext";
import type { TransporterMatch } from "../../src/types";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [transporterMatches, setTransporterMatches] = useState<
    TransporterMatch[]
  >([]);
  const [showTransporters, setShowTransporters] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ordersService.getOrderById(id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleMatchTransporters = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const response = await ordersService.matchTransporter(order.id);
      if (response.success && response.data) {
        setTransporterMatches(response.data.matches);
        setShowTransporters(true);
      }
    } catch (error) {
      console.error("Error matching transporters:", error);
      Alert.alert("Error", "Failed to find transporters");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTransporter = async (match: TransporterMatch) => {
    if (!order) return;

    Alert.alert(
      "Assign Transporter",
      `Assign ${match.transporter.fullName} for $${match.transporter.baseLocation}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersService.assignTransporter(order.id, {
                transporterId: match.transporterId,
                transportCost: "0", // This should be calculated
              });
              Alert.alert("Success", "Transporter assigned successfully");
              fetchOrder();
              setShowTransporters(false);
            } catch (error) {
              console.error("Error assigning transporter:", error);
              Alert.alert("Error", "Failed to assign transporter");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    Alert.alert(
      "Confirm Delivery",
      "Have you received the order? This will release the payment to the seller.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersService.confirmDelivery(order.id);
              Alert.alert("Success", "Delivery confirmed! Payment released.");
              fetchOrder();
            } catch (error) {
              console.error("Error confirming delivery:", error);
              Alert.alert("Error", "Failed to confirm delivery");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await ordersService.cancelOrder(order.id);
            Alert.alert("Success", "Order cancelled");
            fetchOrder();
          } catch (error) {
            console.error("Error cancelling order:", error);
            Alert.alert("Error", "Failed to cancel order");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return neumorphicColors.semantic.success;
      case "in_transit":
      case "assigned":
        return neumorphicColors.semantic.info;
      case "paid":
        return neumorphicColors.primary[600];
      case "pending":
      case "payment_pending":
        return neumorphicColors.secondary[500];
      case "cancelled":
      case "disputed":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return CheckCircle;
      case "in_transit":
        return Truck;
      case "assigned":
      case "paid":
        return DollarSign;
      case "pending":
      case "payment_pending":
        return Clock;
      case "cancelled":
        return XCircle;
      case "disputed":
        return AlertCircle;
      default:
        return Package;
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (!order) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={neumorphicColors.semantic.error} />
          <Text style={styles.errorTitle}>Order not found</Text>
          <NeumorphicButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </NeumorphicScreen>
    );
  }

  const StatusIcon = getStatusIcon(order.status);
  const otherParty = user?.role === "buyer" ? order.farmer : order.buyer;
  const isBuyer = user?.role === "buyer";
  const isFarmer = user?.role === "farmer";

  return (
    <NeumorphicScreen variant="detail" showLeaves={false}>
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />
        <Text style={styles.title}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <NeumorphicCard style={styles.statusCard} variant="elevated">
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(order.status)}20` },
              ]}
            >
              <StatusIcon size={20} color={getStatusColor(order.status)} />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {formatStatus(order.status)}
              </Text>
            </View>
            <Text style={styles.orderId}>
              #{order.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </NeumorphicCard>

        {/* Product Info */}
        {order.listing && (
          <NeumorphicCard style={styles.card} animationDelay={100}>
            <Text style={styles.cardTitle}>Product</Text>
            <View style={styles.productRow}>
              {order.listing.images?.[0] && (
                <Image
                  source={{ uri: order.listing.images[0] }}
                  style={styles.productImage}
                />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {order.listing.cropName || order.listing.cropType}
                </Text>
                <Text style={styles.productDetail}>
                  {order.quantity} {order.listing.unit}
                </Text>
                <Text style={styles.productPrice}>
                  {formatAmount(order.listing.pricePerUnit)}/
                  {order.listing.unit}
                </Text>
              </View>
            </View>
          </NeumorphicCard>
        )}

        {/* Other Party Info */}
        {otherParty && (
          <NeumorphicCard style={styles.card} animationDelay={200}>
            <Text style={styles.cardTitle}>{isBuyer ? "Seller" : "Buyer"}</Text>
            <View style={styles.partyRow}>
              <View style={styles.partyAvatar}>
                <User size={24} color={neumorphicColors.primary[600]} />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyName}>{otherParty.fullName}</Text>
                <Text style={styles.partyContact}>{otherParty.email}</Text>
              </View>
            </View>
            <View style={styles.partyActions}>
              <NeumorphicButton
                title="Call"
                onPress={() => handleCall(otherParty.phone)}
                variant="secondary"
                size="small"
                icon={<Phone size={18} color={neumorphicColors.primary[600]} />}
              />
              <NeumorphicButton
                title="Chat"
                onPress={() => handleChat(otherParty.id)}
                variant="secondary"
                size="small"
                icon={
                  <MessageCircle
                    size={18}
                    color={neumorphicColors.primary[600]}
                  />
                }
              />
            </View>
          </NeumorphicCard>
        )}

        {/* Delivery Info */}
        <NeumorphicCard style={styles.card} animationDelay={300}>
          <Text style={styles.cardTitle}>Delivery</Text>
          <View style={styles.infoRow}>
            <MapPin size={18} color={neumorphicColors.text.secondary} />
            <Text style={styles.infoText}>{order.deliveryLocation}</Text>
          </View>
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </NeumorphicCard>

        {/* Transport Info */}
        {order.transportAssignment && (
          <NeumorphicCard style={styles.card} animationDelay={400}>
            <Text style={styles.cardTitle}>Transport</Text>
            <View style={styles.transportInfo}>
              <Truck size={20} color={neumorphicColors.semantic.info} />
              <View style={styles.transportDetails}>
                <Text style={styles.transporterName}>
                  {order.transportAssignment.transporter?.fullName ||
                    "Transporter Assigned"}
                </Text>
                <Text style={styles.transportStatus}>
                  Status: {order.transportAssignment.status}
                </Text>
                <Text style={styles.transportCost}>
                  Cost: {formatAmount(order.transportAssignment.transportCost)}
                </Text>
              </View>
            </View>
          </NeumorphicCard>
        )}

        {/* Payment Summary */}
        <NeumorphicCard style={styles.card} animationDelay={500}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(order.totalAmount)}
            </Text>
          </View>
          {order.transportAssignment && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Transport Cost</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(order.transportAssignment.transportCost)}
              </Text>
            </View>
          )}
        </NeumorphicCard>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Farmer can match transporters for paid orders */}
          {isFarmer &&
            order.status === "paid" &&
            !order.transportAssignment && (
              <NeumorphicButton
                title="Find Transporters"
                onPress={handleMatchTransporters}
                variant="primary"
                loading={actionLoading}
                fullWidth
                style={styles.actionBtn}
              />
            )}

          {/* Buyer can confirm delivery */}
          {isBuyer && order.status === "delivered" && (
            <NeumorphicButton
              title="Confirm Delivery"
              onPress={handleConfirmDelivery}
              variant="primary"
              loading={actionLoading}
              fullWidth
              style={styles.actionBtn}
            />
          )}

          {/* Both can cancel pending orders */}
          {(order.status === "pending" ||
            order.status === "payment_pending") && (
            <NeumorphicButton
              title="Cancel Order"
              onPress={handleCancelOrder}
              variant="secondary"
              loading={actionLoading}
              fullWidth
              style={styles.actionBtn}
            />
          )}
        </View>

        {/* Transporter Selection Modal */}
        {showTransporters && transporterMatches.length > 0 && (
          <NeumorphicCard style={styles.transporterModal} variant="elevated">
            <Text style={styles.cardTitle}>Select Transporter</Text>
            {transporterMatches.map((match, index) => (
              <TouchableOpacity
                key={match.transporterId}
                style={styles.transporterOption}
                onPress={() => handleAssignTransporter(match)}
              >
                <View style={styles.transporterInfo}>
                  <Text style={styles.transporterName}>
                    {match.transporter.fullName}
                  </Text>
                  <Text style={styles.transporterDetail}>
                    {match.transporter.vehicleType} •{" "}
                    {match.transporter.completedDeliveries} deliveries
                  </Text>
                  <Text style={styles.transporterRating}>
                    Rating: {match.transporter.rating} ⭐
                  </Text>
                </View>
                <View style={styles.matchScore}>
                  <Text style={styles.matchScoreText}>{match.matchScore}%</Text>
                  <Text style={styles.matchLabel}>match</Text>
                </View>
              </TouchableOpacity>
            ))}
            <NeumorphicButton
              title="Cancel"
              onPress={() => setShowTransporters(false)}
              variant="secondary"
              fullWidth
              style={styles.cancelBtn}
            />
          </NeumorphicCard>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginVertical: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  placeholder: {
    width: 48,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.body,
    fontWeight: "600",
  },
  orderId: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
  },
  orderDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
  },
  productDetail: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.primary[600],
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  partyContact: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  partyActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  actionText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.primary[600],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    flex: 1,
  },
  notesBox: {
    backgroundColor: neumorphicColors.base.input,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  notesLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.primary,
  },
  transportInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  transportDetails: {
    flex: 1,
  },
  transporterName: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  transportStatus: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  transportCost: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: neumorphicColors.primary[600],
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.input,
  },
  summaryLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  summaryValue: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  actionsContainer: {
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
  transporterModal: {
    marginTop: spacing.lg,
  },
  transporterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  transporterInfo: {
    flex: 1,
  },
  transporterDetail: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  transporterRating: {
    ...typography.bodySmall,
    color: neumorphicColors.secondary[600],
    marginTop: spacing.xs,
  },
  matchScore: {
    alignItems: "center",
    backgroundColor: `${neumorphicColors.semantic.success}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  matchScoreText: {
    ...typography.h5,
    color: neumorphicColors.semantic.success,
  },
  matchLabel: {
    ...typography.caption,
    color: neumorphicColors.semantic.success,
  },
  cancelBtn: {
    marginTop: spacing.md,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});

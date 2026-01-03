import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
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
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";
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
        return theme.colors.success;
      case "in_transit":
      case "assigned":
        return theme.colors.info;
      case "paid":
        return theme.colors.primary[600];
      case "pending":
      case "payment_pending":
        return theme.colors.secondary[500];
      case "cancelled":
      case "disputed":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Order not found</Text>
          <AnimatedButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const StatusIcon = getStatusIcon(order.status);
  const otherParty = user?.role === "buyer" ? order.farmer : order.buyer;
  const isBuyer = user?.role === "buyer";
  const isFarmer = user?.role === "farmer";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <AnimatedCard style={styles.statusCard}>
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
        </AnimatedCard>

        {/* Product Info */}
        {order.listing && (
          <AnimatedCard style={styles.card} delay={100}>
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
          </AnimatedCard>
        )}

        {/* Other Party Info */}
        {otherParty && (
          <AnimatedCard style={styles.card} delay={200}>
            <Text style={styles.cardTitle}>{isBuyer ? "Seller" : "Buyer"}</Text>
            <View style={styles.partyRow}>
              <View style={styles.partyAvatar}>
                <User size={24} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyName}>{otherParty.fullName}</Text>
                <Text style={styles.partyContact}>{otherParty.email}</Text>
              </View>
            </View>
            <View style={styles.partyActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCall(otherParty.phone)}
              >
                <Phone size={18} color={theme.colors.primary[600]} />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleChat(otherParty.id)}
              >
                <MessageCircle size={18} color={theme.colors.primary[600]} />
                <Text style={styles.actionText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        )}

        {/* Delivery Info */}
        <AnimatedCard style={styles.card} delay={300}>
          <Text style={styles.cardTitle}>Delivery</Text>
          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.text.secondary} />
            <Text style={styles.infoText}>{order.deliveryLocation}</Text>
          </View>
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </AnimatedCard>

        {/* Transport Info */}
        {order.transportAssignment && (
          <AnimatedCard style={styles.card} delay={400}>
            <Text style={styles.cardTitle}>Transport</Text>
            <View style={styles.transportInfo}>
              <Truck size={20} color={theme.colors.info} />
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
          </AnimatedCard>
        )}

        {/* Payment Summary */}
        <AnimatedCard style={styles.card} delay={500}>
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
        </AnimatedCard>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Farmer can match transporters for paid orders */}
          {isFarmer &&
            order.status === "paid" &&
            !order.transportAssignment && (
              <AnimatedButton
                title="Find Transporters"
                onPress={handleMatchTransporters}
                variant="primary"
                loading={actionLoading}
                style={styles.actionBtn}
              />
            )}

          {/* Buyer can confirm delivery */}
          {isBuyer && order.status === "delivered" && (
            <AnimatedButton
              title="Confirm Delivery"
              onPress={handleConfirmDelivery}
              variant="primary"
              loading={actionLoading}
              style={styles.actionBtn}
            />
          )}

          {/* Both can cancel pending orders */}
          {(order.status === "pending" ||
            order.status === "payment_pending") && (
            <AnimatedButton
              title="Cancel Order"
              onPress={handleCancelOrder}
              variant="outline"
              loading={actionLoading}
              style={styles.actionBtn}
            />
          )}
        </View>

        {/* Transporter Selection Modal */}
        {showTransporters && transporterMatches.length > 0 && (
          <AnimatedCard style={styles.transporterModal}>
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
            <AnimatedButton
              title="Cancel"
              onPress={() => setShowTransporters(false)}
              variant="outline"
              style={styles.cancelBtn}
            />
          </AnimatedCard>
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
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  statusCard: {
    marginBottom: theme.spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  orderId: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  orderDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  productDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  partyContact: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  partyActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  },
  notesBox: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  notesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  transportInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  transportDetails: {
    flex: 1,
  },
  transporterName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  transportStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transportCost: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  actionsContainer: {
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionBtn: {
    marginBottom: theme.spacing.sm,
  },
  transporterModal: {
    marginTop: theme.spacing.lg,
  },
  transporterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  transporterInfo: {
    flex: 1,
  },
  transporterDetail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transporterRating: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning,
    marginTop: theme.spacing.xs,
  },
  matchScore: {
    alignItems: "center",
    backgroundColor: theme.colors.success + "20",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  matchScoreText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  matchLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success,
  },
  cancelBtn: {
    marginTop: theme.spacing.md,
  },
  bottomPadding: {
    height: theme.spacing["4xl"],
  },
});

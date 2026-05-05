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
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  Lock,
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
  NeumorphicInput,
} from "../../src/components/neumorphic";
import ordersService, {
  OrderWithDetails,
} from "../../src/services/ordersService";
import { useAuth } from "../../src/contexts/AuthContext";
import type { TransporterMatch } from "../../src/types";
import api from "../../src/services/api";

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
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffPassword, setHandoffPassword] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [hasDeliveryPassword, setHasDeliveryPassword] = useState<
    boolean | null
  >(null);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordSetupError, setPasswordSetupError] = useState("");
  const [passwordSetupLoading, setPasswordSetupLoading] = useState(false);
  const [passwordSetupSuccess, setPasswordSetupSuccess] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ordersService.getOrderById(id);
      if (response.success && response.data) {
        console.log("Order data:", {
          status: response.data.status,
          transportAssignment: response.data.transportAssignment,
          transporterId: response.data.transportAssignment?.transporterId,
          userId: user?.id,
          userRole: user?.role,
        });
        setOrder(response.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const checkDeliveryPasswordStatus = useCallback(async () => {
    try {
      const response = await api.get("/auth/delivery-password/status");
      if (response.data?.success) {
        setHasDeliveryPassword(
          response.data.data?.hasDeliveryPassword ?? false,
        );
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (
      user?.role === "buyer" ||
      user?.role === "farmer" ||
      user?.role === "agro_supplier"
    ) {
      checkDeliveryPasswordStatus();
    }
  }, [user, checkDeliveryPasswordStatus]);

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

  const handleHandoffConfirm = async () => {
    if (!order) return;

    if (!handoffPassword.trim()) {
      setHandoffError("Please enter the buyer's delivery password.");
      return;
    }

    setHandoffLoading(true);
    try {
      const response = await api.post(`/orders/${order.id}/handoff-confirm`, {
        deliveryPassword: handoffPassword.trim(),
      });

      if (response.data?.success) {
        setHandoffSuccess(true);
        setHandoffError("");
        fetchOrder();
        setTimeout(() => {
          setShowHandoffModal(false);
          setHandoffPassword("");
          setHandoffSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Incorrect password or handoff failed.";

      if (error.response?.data?.data?.fallbackRequired) {
        setHandoffError(
          "The buyer has not set a delivery password. Ask them to confirm delivery from their account instead.",
        );
      } else {
        setHandoffError(message);
      }
    } finally {
      setHandoffLoading(false);
    }
  };

  const handleSetDeliveryPassword = async () => {
    const trimmedPassword = newPassword.trim();
    const trimmedCurrent = currentPassword.trim();

    if (trimmedPassword.length < 4) {
      setPasswordSetupError("Password must be at least 4 characters.");
      return;
    }

    if (hasDeliveryPassword && !trimmedCurrent) {
      setPasswordSetupError("Current delivery password is required.");
      return;
    }

    setPasswordSetupLoading(true);
    setPasswordSetupError("");
    try {
      const payload: { password: string; currentPassword?: string } = {
        password: trimmedPassword,
      };

      if (hasDeliveryPassword) {
        payload.currentPassword = trimmedCurrent;
      }

      const response = await api.put("/auth/delivery-password", payload);

      if (response.data?.success) {
        setHasDeliveryPassword(true);
        setPasswordSetupSuccess(
          response.data?.message || "Delivery password saved.",
        );
        setNewPassword("");
        setCurrentPassword("");
        setTimeout(() => {
          setShowPasswordSetup(false);
          setPasswordSetupSuccess("");
        }, 2000);
      }
    } catch (error: any) {
      setPasswordSetupError(
        error.response?.data?.message || "Failed to set delivery password.",
      );
    } finally {
      setPasswordSetupLoading(false);
    }
  };

  const openHandoffModal = () => {
    setHandoffPassword("");
    setHandoffError("");
    setHandoffSuccess(false);
    setShowHandoffModal(true);
  };

  const openPasswordSetup = () => {
    setPasswordSetupError("");
    setPasswordSetupSuccess("");
    setNewPassword("");
    setCurrentPassword("");
    setShowPasswordSetup(true);
  };

  const handleApproveOrder = async () => {
    if (!order) return;

    Alert.alert(
      "Approve Order",
      "Approve this order? Buyer funds will then be held in escrow.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersService.updateOrderStatus(order.id, "paid");
              Alert.alert(
                "Success",
                "Order approved. Buyer funds are now secured in escrow."
              );
              fetchOrder();
            } catch (error) {
              console.error("Error approving order:", error);
              Alert.alert("Error", "Failed to approve order");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeclineOrder = async () => {
    if (!order) return;

    Alert.alert(
      "Decline Order",
      "Decline this order? No payment will be processed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersService.updateOrderStatus(order.id, "cancelled");
              Alert.alert("Success", "Order declined. Buyer was notified.");
              fetchOrder();
            } catch (error) {
              console.error("Error declining order:", error);
              Alert.alert("Error", "Failed to decline order");
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

  // Transporter marks order as collected (in_transit)
  const handleMarkCollected = async () => {
    if (!order) return;

    Alert.alert(
      "Mark as Collected",
      "Confirm that you have collected the goods from the farmer and are now in transit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Collection",
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersService.updateOrderStatus(order.id, "in_transit");
              Alert.alert(
                "Success",
                "Order marked as collected. You are now in transit."
              );
              fetchOrder();
            } catch (error) {
              console.error("Error marking collected:", error);
              Alert.alert("Error", "Failed to update order status");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Transporter marks order as delivered
  const handleMarkDelivered = async () => {
    if (!order) return;

    Alert.alert(
      "Mark as Delivered",
      "Confirm that you have delivered the goods to the buyer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Delivery",
          onPress: async () => {
            setActionLoading(true);
            try {
              await ordersService.updateOrderStatus(order.id, "delivered");
              Alert.alert(
                "Success",
                "Order marked as delivered. Waiting for buyer confirmation."
              );
              fetchOrder();
            } catch (error) {
              console.error("Error marking delivered:", error);
              Alert.alert("Error", "Failed to update order status");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
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
    if (status === "pending") return "Awaiting Farmer Approval";
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
  const isTransporter = user?.role === "transporter";
  const isAssignedTransporter =
    isTransporter && order.transportAssignment?.transporterId === user?.id;
  const canInitiateHandoff =
    (isFarmer || isAssignedTransporter) && order.status === "delivered";

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
        {isBuyer && hasDeliveryPassword === false && (
          <NeumorphicCard
            style={[styles.card, styles.passwordPromptCard]}
            animationDelay={80}
          >
            <View style={styles.passwordPromptHeader}>
              <View style={styles.passwordPromptIcon}>
                <Lock size={20} color={neumorphicColors.secondary[600]} />
              </View>
              <View style={styles.passwordPromptContent}>
                <Text style={styles.passwordPromptTitle}>
                  Set your delivery password
                </Text>
                <Text style={styles.passwordPromptText}>
                  Set a delivery password so the farmer or transporter can
                  confirm receipt on your behalf during handoff.
                </Text>
              </View>
            </View>
            <NeumorphicButton
              title="Set Delivery Password"
              onPress={openPasswordSetup}
              variant="primary"
              size="small"
              fullWidth
            />
          </NeumorphicCard>
        )}

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

        {isBuyer && hasDeliveryPassword !== null && (
          <NeumorphicCard style={styles.card} animationDelay={550}>
            <View style={styles.passwordStatusRow}>
              <Text style={styles.cardTitle}>Delivery Password</Text>
              <View
                style={[
                  styles.passwordStatusBadge,
                  hasDeliveryPassword
                    ? styles.passwordStatusBadgeSet
                    : styles.passwordStatusBadgeUnset,
                ]}
              >
                <Text
                  style={
                    hasDeliveryPassword
                      ? styles.passwordStatusTextSet
                      : styles.passwordStatusTextUnset
                  }
                >
                  {hasDeliveryPassword ? "Set" : "Not set"}
                </Text>
              </View>
            </View>
            <Text style={styles.passwordPromptText}>
              Used by the farmer or transporter to confirm receipt on your
              behalf at handoff.
            </Text>
            <NeumorphicButton
              title={hasDeliveryPassword ? "Change Password" : "Set Password"}
              onPress={openPasswordSetup}
              variant="secondary"
              size="small"
              fullWidth
              style={styles.inlineButton}
            />
          </NeumorphicCard>
        )}

        {canInitiateHandoff && (
          <NeumorphicCard style={[styles.card, styles.handoffCard]}>
            <Text style={styles.cardTitle}>Handoff Confirmation</Text>
            <Text style={styles.handoffText}>
              Hand your phone to the buyer. They enter their delivery password
              to release payment instantly.
            </Text>
            <NeumorphicButton
              title="Confirm Handoff"
              onPress={openHandoffModal}
              variant="primary"
              fullWidth
            />
          </NeumorphicCard>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Farmer approval gate */}
          {isFarmer && order.status === "pending" && (
            <>
              <NeumorphicButton
                title="Approve Order"
                onPress={handleApproveOrder}
                variant="primary"
                loading={actionLoading}
                fullWidth
                style={styles.actionBtn}
                icon={
                  <CheckCircle size={20} color={neumorphicColors.text.inverse} />
                }
              />
              <NeumorphicButton
                title="Decline Order"
                onPress={handleDeclineOrder}
                variant="secondary"
                loading={actionLoading}
                fullWidth
                style={styles.actionBtn}
                icon={<XCircle size={20} color={neumorphicColors.text.primary} />}
              />
            </>
          )}

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

          {/* Transporter can mark order as collected when assigned */}
          {isAssignedTransporter &&
            (order.status === "assigned" || order.status === "paid") && (
              <NeumorphicButton
                title="Mark as Collected"
                onPress={handleMarkCollected}
                variant="primary"
                loading={actionLoading}
                fullWidth
                style={styles.actionBtn}
                icon={<Truck size={20} color={neumorphicColors.text.inverse} />}
              />
            )}

          {/* Transporter can mark order as delivered when in transit */}
          {isAssignedTransporter && order.status === "in_transit" && (
            <NeumorphicButton
              title="Mark as Delivered"
              onPress={handleMarkDelivered}
              variant="primary"
              loading={actionLoading}
              fullWidth
              style={styles.actionBtn}
              icon={
                <CheckCircle size={20} color={neumorphicColors.text.inverse} />
              }
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

      <Modal
        visible={showHandoffModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHandoffModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <NeumorphicCard style={styles.modalCard} animated={false}>
            {handoffSuccess ? (
              <View style={styles.modalSuccessContainer}>
                <CheckCircle
                  size={44}
                  color={neumorphicColors.semantic.success}
                />
                <Text style={styles.modalSuccessTitle}>Payment Released</Text>
                <Text style={styles.modalSuccessText}>
                  Transaction complete. Thank you.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>Buyer Confirmation</Text>
                <Text style={styles.modalSubtitle}>
                  Hand the phone to the buyer to enter their delivery password.
                </Text>
                <NeumorphicInput
                  label="Delivery Password"
                  value={handoffPassword}
                  onChangeText={setHandoffPassword}
                  placeholder="Enter delivery password"
                  secureTextEntry
                  showPasswordToggle
                  containerStyle={styles.modalInput}
                  autoFocus
                />
                {handoffError ? (
                  <Text style={styles.modalError}>{handoffError}</Text>
                ) : null}
                <NeumorphicButton
                  title="Confirm and Release Payment"
                  onPress={handleHandoffConfirm}
                  variant="primary"
                  loading={handoffLoading}
                  fullWidth
                  style={styles.modalPrimaryButton}
                />
                <NeumorphicButton
                  title="Cancel"
                  onPress={() => setShowHandoffModal(false)}
                  variant="secondary"
                  fullWidth
                />
              </>
            )}
          </NeumorphicCard>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showPasswordSetup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordSetup(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <NeumorphicCard style={styles.modalCard} animated={false}>
            <Text style={styles.modalTitle}>
              {hasDeliveryPassword ? "Change" : "Set"} Delivery Password
            </Text>
            <Text style={styles.modalSubtitle}>
              This password is used at delivery so the seller can confirm
              receipt on your behalf.
            </Text>

            {hasDeliveryPassword && (
              <NeumorphicInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
                showPasswordToggle
                containerStyle={styles.modalInput}
              />
            )}

            <NeumorphicInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 4 characters"
              secureTextEntry
              showPasswordToggle
              containerStyle={styles.modalInput}
            />

            {passwordSetupError ? (
              <Text style={styles.modalError}>{passwordSetupError}</Text>
            ) : null}
            {passwordSetupSuccess ? (
              <Text style={styles.modalSuccessInline}>
                {passwordSetupSuccess}
              </Text>
            ) : null}

            <View style={styles.modalButtonRow}>
              <NeumorphicButton
                title="Cancel"
                onPress={() => setShowPasswordSetup(false)}
                variant="secondary"
                style={styles.modalHalfButton}
              />
              <NeumorphicButton
                title="Save Password"
                onPress={handleSetDeliveryPassword}
                variant="primary"
                loading={passwordSetupLoading}
                style={styles.modalHalfButton}
              />
            </View>
          </NeumorphicCard>
        </KeyboardAvoidingView>
      </Modal>
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
  passwordPromptCard: {
    backgroundColor: neumorphicColors.secondary[50],
    borderWidth: 1,
    borderColor: neumorphicColors.secondary[200],
  },
  passwordPromptHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  passwordPromptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neumorphicColors.secondary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  passwordPromptContent: {
    flex: 1,
  },
  passwordPromptTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
  },
  passwordPromptText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  passwordStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  passwordStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  passwordStatusBadgeSet: {
    backgroundColor: `${neumorphicColors.semantic.success}20`,
  },
  passwordStatusBadgeUnset: {
    backgroundColor: `${neumorphicColors.semantic.warning}20`,
  },
  passwordStatusTextSet: {
    ...typography.caption,
    color: neumorphicColors.semantic.success,
    fontWeight: "600",
  },
  passwordStatusTextUnset: {
    ...typography.caption,
    color: neumorphicColors.semantic.warning,
    fontWeight: "600",
  },
  inlineButton: {
    marginTop: spacing.md,
  },
  handoffCard: {
    backgroundColor: neumorphicColors.primary[50],
    borderWidth: 1,
    borderColor: neumorphicColors.primary[200],
  },
  handoffText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  modalError: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalSuccessContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  modalSuccessTitle: {
    ...typography.h4,
    color: neumorphicColors.semantic.success,
    marginTop: spacing.sm,
  },
  modalSuccessText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  modalSuccessInline: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.success,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalPrimaryButton: {
    marginBottom: spacing.sm,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalHalfButton: {
    flex: 1,
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

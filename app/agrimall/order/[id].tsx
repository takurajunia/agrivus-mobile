import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  User,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  Calendar,
  Store,
} from "lucide-react-native";
import AnimatedCard from "../../../src/components/AnimatedCard";
import AnimatedButton from "../../../src/components/AnimatedButton";
import GlassCard from "../../../src/components/GlassCard";
import { theme } from "../../../src/theme/tokens";
import agrimallService from "../../../src/services/agrimallService";
import { useAuth } from "../../../src/contexts/AuthContext";

interface AgrimallOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    imageUrl?: string;
  };
  quantity: number;
  buyer: {
    id: string;
    name: string;
    phone: string;
  };
  vendor: {
    id: string;
    name: string;
    phone: string;
    storeName: string;
  };
  deliveryAddress: string;
  pickupLocation: string;
  notes?: string;
  vendorNotes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  rating?: number;
  review?: string;
}

const STATUS_OPTIONS = [
  { value: "processing", label: "Processing" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "shipped", label: "Shipped" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
];

export default function AgriMallOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<AgrimallOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const isVendor =
    (user?.role as string) === "vendor" || order?.vendor?.id === user?.id;
  const isBuyer = order?.buyer?.id === user?.id;

  const fetchOrder = useCallback(
    async (refresh = false) => {
      if (!id) return;

      try {
        if (refresh) {
          setRefreshing(true);
        }

        const response = await agrimallService.getOrder(id);

        if (response.success || response.data) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        Alert.alert("Error", "Failed to load order details");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRefresh = useCallback(() => {
    fetchOrder(true);
  }, [fetchOrder]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Alert.alert("Required", "Please select a status");
      return;
    }

    try {
      setProcessing(true);
      await agrimallService.updateOrderStatus(id!, selectedStatus, vendorNotes);
      Alert.alert("Success", "Order status updated");
      setShowStatusModal(false);
      setSelectedStatus("");
      setVendorNotes("");
      fetchOrder(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update status"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelivery = async () => {
    Alert.alert(
      "Confirm Delivery",
      "Confirm you have received this order? This will release funds to the vendor.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setProcessing(true);
              await agrimallService.confirmDelivery(id!, rating, review);
              Alert.alert(
                "Success",
                "Delivery confirmed! Funds released to vendor."
              );
              fetchOrder(true);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to confirm delivery"
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = async () => {
    Alert.prompt(
      "Cancel Order",
      "Please provide a reason for cancellation:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async (reason: string | undefined) => {
            if (!reason?.trim()) {
              Alert.alert("Required", "Please provide a reason");
              return;
            }
            try {
              setProcessing(true);
              await agrimallService.cancelOrder(id!, reason);
              Alert.alert("Success", "Order cancelled");
              fetchOrder(true);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to cancel order"
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleChat = (userId: string) => {
    router.push(`/chat/${userId}` as any);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return theme.colors.text.tertiary;
      case "paid":
        return theme.colors.info;
      case "processing":
        return theme.colors.warning;
      case "ready_for_pickup":
        return theme.colors.secondary[600];
      case "shipped":
      case "in_transit":
        return theme.colors.primary[600];
      case "delivered":
      case "confirmed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={20} color={getStatusColor(status)} />;
      case "processing":
        return <Package size={20} color={getStatusColor(status)} />;
      case "shipped":
      case "in_transit":
        return <Truck size={20} color={getStatusColor(status)} />;
      case "delivered":
      case "confirmed":
        return <CheckCircle size={20} color={getStatusColor(status)} />;
      case "cancelled":
        return <XCircle size={20} color={getStatusColor(status)} />;
      default:
        return <Clock size={20} color={getStatusColor(status)} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
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
        <View style={styles.errorContainer}>
          <Package
            size={64}
            color={theme.colors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The order you're looking for doesn't exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.orderNumber}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {/* Status Card */}
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon(order.status)}
            <View style={styles.statusInfo}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {order.status?.replace(/_/g, " ").toUpperCase()}
              </Text>
              <Text style={styles.statusDate}>
                Updated: {formatDate(order.updatedAt)}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Product Details */}
        <Text style={styles.sectionTitle}>Product</Text>
        <AnimatedCard style={styles.productCard}>
          <View style={styles.productInfo}>
            <Package size={40} color={theme.colors.primary[600]} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{order.product?.name}</Text>
              <Text style={styles.productQuantity}>
                {order.quantity} {order.product?.unit} ×{" "}
                {formatCurrency(order.product?.price)}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <AnimatedCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.product?.price * order.quantity)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.deliveryFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </AnimatedCard>

        {/* Vendor Info */}
        <Text style={styles.sectionTitle}>Vendor</Text>
        <AnimatedCard style={styles.partyCard}>
          <View style={styles.partyHeader}>
            <View style={styles.partyAvatar}>
              <Store size={24} color={theme.colors.primary[600]} />
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyName}>{order.vendor?.storeName}</Text>
              <Text style={styles.partySubtext}>{order.vendor?.name}</Text>
            </View>
          </View>
          {isBuyer && (
            <View style={styles.partyActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCall(order.vendor?.phone)}
              >
                <Phone size={18} color={theme.colors.primary[600]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleChat(order.vendor?.id)}
              >
                <MessageSquare size={18} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            </View>
          )}
        </AnimatedCard>

        {/* Buyer Info (for vendors) */}
        {isVendor && (
          <>
            <Text style={styles.sectionTitle}>Buyer</Text>
            <AnimatedCard style={styles.partyCard}>
              <View style={styles.partyHeader}>
                <View style={styles.partyAvatar}>
                  <User size={24} color={theme.colors.info} />
                </View>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyName}>{order.buyer?.name}</Text>
                  <Text style={styles.partySubtext}>{order.buyer?.phone}</Text>
                </View>
              </View>
              <View style={styles.partyActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCall(order.buyer?.phone)}
                >
                  <Phone size={18} color={theme.colors.primary[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleChat(order.buyer?.id)}
                >
                  <MessageSquare size={18} color={theme.colors.primary[600]} />
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          </>
        )}

        {/* Delivery Info */}
        <Text style={styles.sectionTitle}>Delivery</Text>
        <AnimatedCard style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <MapPin size={18} color={theme.colors.text.tertiary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>
              <Text style={styles.deliveryValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
          {order.pickupLocation && (
            <View style={styles.deliveryRow}>
              <Store size={18} color={theme.colors.text.tertiary} />
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Pickup Location</Text>
                <Text style={styles.deliveryValue}>{order.pickupLocation}</Text>
              </View>
            </View>
          )}
          <View style={styles.deliveryRow}>
            <Calendar size={18} color={theme.colors.text.tertiary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Order Date</Text>
              <Text style={styles.deliveryValue}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Notes */}
        {(order.notes || order.vendorNotes) && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <AnimatedCard style={styles.notesCard}>
              {order.notes && (
                <View style={styles.noteItem}>
                  <Text style={styles.noteLabel}>Buyer Notes</Text>
                  <Text style={styles.noteText}>{order.notes}</Text>
                </View>
              )}
              {order.vendorNotes && (
                <View style={styles.noteItem}>
                  <Text style={styles.noteLabel}>Vendor Notes</Text>
                  <Text style={styles.noteText}>{order.vendorNotes}</Text>
                </View>
              )}
            </AnimatedCard>
          </>
        )}

        {/* Rating */}
        {order.rating && (
          <>
            <Text style={styles.sectionTitle}>Rating & Review</Text>
            <AnimatedCard style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    color={theme.colors.warning}
                    fill={
                      i < order.rating! ? theme.colors.warning : "transparent"
                    }
                  />
                ))}
                <Text style={styles.ratingValue}>{order.rating}/5</Text>
              </View>
              {order.review && (
                <Text style={styles.reviewText}>{order.review}</Text>
              )}
            </AnimatedCard>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {/* Vendor Actions */}
          {isVendor &&
            order.status !== "cancelled" &&
            order.status !== "confirmed" && (
              <AnimatedButton
                title="Update Status"
                variant="primary"
                size="lg"
                onPress={() => setShowStatusModal(true)}
              />
            )}

          {/* Buyer Actions */}
          {isBuyer && order.status === "delivered" && (
            <>
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Rate this order</Text>
                <View style={styles.ratingSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                    >
                      <Star
                        size={32}
                        color={theme.colors.warning}
                        fill={
                          star <= rating ? theme.colors.warning : "transparent"
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write a review (optional)"
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <AnimatedButton
                title="Confirm Delivery"
                variant="primary"
                size="lg"
                loading={processing}
                onPress={handleConfirmDelivery}
              >
                <CheckCircle size={20} color={theme.colors.text.inverse} />
              </AnimatedButton>
            </>
          )}

          {/* Cancel Action */}
          {(isBuyer || isVendor) &&
            ["pending", "paid", "processing"].includes(order.status) && (
              <AnimatedButton
                title="Cancel Order"
                variant="danger"
                size="lg"
                style={{ marginTop: theme.spacing.md }}
                loading={processing}
                onPress={handleCancelOrder}
              >
                <XCircle size={20} color={theme.colors.text.inverse} />
              </AnimatedButton>
            )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Status Update Modal */}
      {showStatusModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>

            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    selectedStatus === option.value &&
                      styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedStatus === option.value &&
                        styles.statusOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              value={vendorNotes}
              onChangeText={setVendorNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <AnimatedButton
                title="Cancel"
                variant="outline"
                size="md"
                style={{ flex: 1 }}
                onPress={() => {
                  setShowStatusModal(false);
                  setSelectedStatus("");
                  setVendorNotes("");
                }}
              />
              <AnimatedButton
                title="Update"
                variant="primary"
                size="md"
                style={{ flex: 1, marginLeft: theme.spacing.md }}
                loading={processing}
                onPress={handleUpdateStatus}
              />
            </View>
          </View>
        </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
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
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  statusCard: {
    padding: theme.spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statusDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  productCard: {
    padding: theme.spacing.lg,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  productQuantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  summaryCard: {
    padding: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  totalRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  partyCard: {
    padding: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  partySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  partyActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryCard: {
    padding: theme.spacing.lg,
  },
  deliveryRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  notesCard: {
    padding: theme.spacing.lg,
  },
  noteItem: {
    marginBottom: theme.spacing.md,
  },
  noteLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  noteText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  ratingCard: {
    padding: theme.spacing.lg,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  ratingValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  reviewText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  confirmSection: {
    marginBottom: theme.spacing.lg,
  },
  confirmLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  ratingSelector: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  reviewInput: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    textAlignVertical: "top",
    minHeight: 80,
  },
  bottomPadding: {
    height: theme.spacing["2xl"],
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statusOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  statusOptionSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  statusOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statusOptionTextSelected: {
    color: theme.colors.text.inverse,
  },
  notesInput: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
  },
});

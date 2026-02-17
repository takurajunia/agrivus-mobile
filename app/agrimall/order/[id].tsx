import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../../src/theme/neumorphic";
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
        return neumorphicColors.text.tertiary;
      case "paid":
        return neumorphicColors.semantic.info;
      case "processing":
        return neumorphicColors.semantic.warning;
      case "ready_for_pickup":
        return neumorphicColors.secondary[600];
      case "shipped":
      case "in_transit":
        return neumorphicColors.primary[600];
      case "delivered":
      case "confirmed":
        return neumorphicColors.semantic.success;
      case "cancelled":
        return neumorphicColors.semantic.error;
      default:
        return neumorphicColors.text.tertiary;
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
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="default"
            size="medium"
          />
          <Text style={styles.title}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Package
            size={64}
            color={neumorphicColors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The order you're looking for doesn't exist.
          </Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="detail" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
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
            colors={[neumorphicColors.primary[600]]}
            tintColor={neumorphicColors.primary[600]}
          />
        }
      >
        {/* Status Card */}
        <NeumorphicCard style={styles.statusCard} variant="elevated">
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
        </NeumorphicCard>

        {/* Product Details */}
        <Text style={styles.sectionTitle}>Product</Text>
        <NeumorphicCard style={styles.productCard}>
          <View style={styles.productInfo}>
            <Package size={40} color={neumorphicColors.primary[600]} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{order.product?.name}</Text>
              <Text style={styles.productQuantity}>
                {order.quantity} {order.product?.unit} ×{" "}
                {formatCurrency(order.product?.price)}
              </Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <NeumorphicCard style={styles.summaryCard}>
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
        </NeumorphicCard>

        {/* Vendor Info */}
        <Text style={styles.sectionTitle}>Vendor</Text>
        <NeumorphicCard style={styles.partyCard}>
          <View style={styles.partyHeader}>
            <View style={styles.partyAvatar}>
              <Store size={24} color={neumorphicColors.primary[600]} />
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyName}>{order.vendor?.storeName}</Text>
              <Text style={styles.partySubtext}>{order.vendor?.name}</Text>
            </View>
          </View>
          {isBuyer && (
            <View style={styles.partyActions}>
              <NeumorphicIconButton
                icon={<Phone size={18} color={neumorphicColors.primary[600]} />}
                onPress={() => handleCall(order.vendor?.phone)}
                variant="secondary"
                size="medium"
              />
              <NeumorphicIconButton
                icon={
                  <MessageSquare
                    size={18}
                    color={neumorphicColors.primary[600]}
                  />
                }
                onPress={() => handleChat(order.vendor?.id)}
                variant="secondary"
                size="medium"
              />
            </View>
          )}
        </NeumorphicCard>

        {/* Buyer Info (for vendors) */}
        {isVendor && (
          <>
            <Text style={styles.sectionTitle}>Buyer</Text>
            <NeumorphicCard style={styles.partyCard}>
              <View style={styles.partyHeader}>
                <View style={styles.partyAvatar}>
                  <User size={24} color={neumorphicColors.semantic.info} />
                </View>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyName}>{order.buyer?.name}</Text>
                  <Text style={styles.partySubtext}>{order.buyer?.phone}</Text>
                </View>
              </View>
              <View style={styles.partyActions}>
                <NeumorphicIconButton
                  icon={
                    <Phone size={18} color={neumorphicColors.primary[600]} />
                  }
                  onPress={() => handleCall(order.buyer?.phone)}
                  variant="secondary"
                  size="medium"
                />
                <NeumorphicIconButton
                  icon={
                    <MessageSquare
                      size={18}
                      color={neumorphicColors.primary[600]}
                    />
                  }
                  onPress={() => handleChat(order.buyer?.id)}
                  variant="secondary"
                  size="medium"
                />
              </View>
            </NeumorphicCard>
          </>
        )}

        {/* Delivery Info */}
        <Text style={styles.sectionTitle}>Delivery</Text>
        <NeumorphicCard style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <MapPin size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>
              <Text style={styles.deliveryValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
          {order.pickupLocation && (
            <View style={styles.deliveryRow}>
              <Store size={18} color={neumorphicColors.text.tertiary} />
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Pickup Location</Text>
                <Text style={styles.deliveryValue}>{order.pickupLocation}</Text>
              </View>
            </View>
          )}
          <View style={styles.deliveryRow}>
            <Calendar size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Order Date</Text>
              <Text style={styles.deliveryValue}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Notes */}
        {(order.notes || order.vendorNotes) && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <NeumorphicCard style={styles.notesCard}>
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
            </NeumorphicCard>
          </>
        )}

        {/* Rating */}
        {order.rating && (
          <>
            <Text style={styles.sectionTitle}>Rating & Review</Text>
            <NeumorphicCard style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    color={neumorphicColors.semantic.warning}
                    fill={
                      i < order.rating!
                        ? neumorphicColors.semantic.warning
                        : "transparent"
                    }
                  />
                ))}
                <Text style={styles.ratingValue}>{order.rating}/5</Text>
              </View>
              {order.review && (
                <Text style={styles.reviewText}>{order.review}</Text>
              )}
            </NeumorphicCard>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {/* Vendor Actions */}
          {isVendor &&
            order.status !== "cancelled" &&
            order.status !== "confirmed" && (
              <NeumorphicButton
                title="Update Status"
                variant="primary"
                size="large"
                onPress={() => setShowStatusModal(true)}
                fullWidth
              />
            )}

          {/* Buyer Actions */}
          {isBuyer && order.status === "delivered" && (
            <>
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Rate this order</Text>
                <View style={styles.ratingSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <NeumorphicIconButton
                      key={star}
                      icon={
                        <Star
                          size={28}
                          color={neumorphicColors.semantic.warning}
                          fill={
                            star <= rating
                              ? neumorphicColors.semantic.warning
                              : "transparent"
                          }
                        />
                      }
                      onPress={() => setRating(star)}
                      variant="ghost"
                      size="medium"
                    />
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write a review (optional)"
                  placeholderTextColor={neumorphicColors.text.tertiary}
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <NeumorphicButton
                title="Confirm Delivery"
                variant="primary"
                size="large"
                loading={processing}
                onPress={handleConfirmDelivery}
                icon={
                  <CheckCircle
                    size={20}
                    color={neumorphicColors.text.inverse}
                  />
                }
                fullWidth
              />
            </>
          )}

          {/* Cancel Action */}
          {(isBuyer || isVendor) &&
            ["pending", "paid", "processing"].includes(order.status) && (
              <NeumorphicButton
                title="Cancel Order"
                variant="danger"
                size="large"
                style={{ marginTop: spacing.md }}
                loading={processing}
                onPress={handleCancelOrder}
                icon={
                  <XCircle size={20} color={neumorphicColors.text.inverse} />
                }
                fullWidth
              />
            )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Status Update Modal */}
      {showStatusModal && (
        <View style={styles.modalOverlay}>
          <NeumorphicCard style={styles.modalContent} variant="elevated">
            <Text style={styles.modalTitle}>Update Status</Text>

            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => (
                <NeumorphicButton
                  key={option.value}
                  title={option.label}
                  variant={
                    selectedStatus === option.value ? "primary" : "secondary"
                  }
                  size="small"
                  onPress={() => setSelectedStatus(option.value)}
                  style={styles.statusOptionButton}
                />
              ))}
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor={neumorphicColors.text.tertiary}
              value={vendorNotes}
              onChangeText={setVendorNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <NeumorphicButton
                title="Cancel"
                variant="secondary"
                size="medium"
                style={{ flex: 1 }}
                onPress={() => {
                  setShowStatusModal(false);
                  setSelectedStatus("");
                  setVendorNotes("");
                }}
              />
              <NeumorphicButton
                title="Update"
                variant="primary"
                size="medium"
                style={{ flex: 1, marginLeft: spacing.md }}
                loading={processing}
                onPress={handleUpdateStatus}
              />
            </View>
          </NeumorphicCard>
        </View>
      )}
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h4,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  statusCard: {
    padding: spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    ...typography.h5,
  },
  statusDate: {
    ...typography.caption,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h5,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  productCard: {
    padding: spacing.lg,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    ...typography.h6,
  },
  productQuantity: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  totalRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.h5,
  },
  totalValue: {
    ...typography.h5,
    color: neumorphicColors.primary[600],
  },
  partyCard: {
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    ...typography.body,
    fontWeight: "600",
  },
  partySubtext: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  partyActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryCard: {
    padding: spacing.lg,
  },
  deliveryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  deliveryValue: {
    ...typography.body,
  },
  notesCard: {
    padding: spacing.lg,
  },
  noteItem: {
    marginBottom: spacing.md,
  },
  noteLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  noteText: {
    ...typography.body,
    lineHeight: 22,
  },
  ratingCard: {
    padding: spacing.lg,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingValue: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  reviewText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.xl,
  },
  confirmSection: {
    marginBottom: spacing.lg,
  },
  confirmLabel: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  ratingSelector: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  reviewInput: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: "transparent",
    textAlignVertical: "top",
    minHeight: 80,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    padding: spacing.xl,
  },
  modalTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.input,
    borderWidth: 1,
    borderColor: neumorphicColors.base.shadowDark,
  },
  statusOptionSelected: {
    backgroundColor: neumorphicColors.primary[600],
    borderColor: neumorphicColors.primary[600],
  },
  statusOptionText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  statusOptionTextSelected: {
    color: neumorphicColors.text.inverse,
  },
  statusOptionButton: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.primary,
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
  },
});

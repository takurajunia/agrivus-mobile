import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Wallet,
  Truck,
  ShieldCheck,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { agrimallService } from "../services/agrimallService";
import { buildOrderFailureMessage } from "../services/orderErrorMessage";
import type { Cart, CheckoutSummary } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import OptimizedImage from "../components/OptimizedImage";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../components/neumorphic/NeumorphicIconButton";
import NeumorphicInput from "../components/neumorphic/NeumorphicInput";

export default function CheckoutScreen() {
  const router = useRouter();

  const [cart, setCart]                       = useState<Cart | null>(null);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [processing, setProcessing]           = useState(false);
  const [error, setError]                     = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    fullName:   "",
    phone:      "",
    address:    "",
    city:       "",
    postalCode: "",
    notes:      "",
  });

  useEffect(() => { fetchCheckoutData(); }, []);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");
      const [cartResponse, summaryResponse] = await Promise.all([
        agrimallService.getCart(),
        agrimallService.getCheckoutSummary(),
      ]);
      setCart(cartResponse.cart);
      setCheckoutSummary(summaryResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const validateShipping = (): boolean => {
    if (!shippingInfo.fullName.trim()) {
      Alert.alert("Missing Info", "Please enter your full name"); return false;
    }
    if (!shippingInfo.phone.trim()) {
      Alert.alert("Missing Info", "Please enter your phone number"); return false;
    }
    if (!shippingInfo.address.trim()) {
      Alert.alert("Missing Info", "Please enter your address"); return false;
    }
    if (!shippingInfo.city.trim()) {
      Alert.alert("Missing Info", "Please enter your city"); return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;
    if (!checkoutSummary) return;

    // Guard: wallet must have sufficient balance
    if (!checkoutSummary.wallet.sufficient) {
      Alert.alert(
        "Insufficient Balance",
        `You need $${checkoutSummary.wallet.shortfall} more in your wallet to complete this order.\n\nPlease top up your wallet first.`,
        [
          { text: "Top Up Wallet", onPress: () => router.push("/wallet" as any) },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    Alert.alert(
      "Confirm Order",
      `Total: $${checkoutSummary.pricing.total}\n\nFunds will be held in escrow until delivery is confirmed.`,
      [
        {
          text: "Place Order",
          onPress: async () => {
            try {
              setProcessing(true);
              const response = await agrimallService.checkout({
                deliveryAddress: [
                  shippingInfo.fullName,
                  shippingInfo.phone,
                  shippingInfo.address,
                  shippingInfo.city,
                  shippingInfo.postalCode,
                ].filter(Boolean).join(", "),
                buyerNotes: shippingInfo.notes || undefined,
              });

              const createdOrders      = response?.data?.orders ?? [];
              const firstOrderId       = createdOrders[0]?.orderId;
              const count              = createdOrders.length;

              Alert.alert(
                count === 1 ? "Order Placed!" : `${count} Orders Placed!`,
                `$${checkoutSummary.pricing.total} held in escrow.`,
                [
                  {
                    text: count === 1 && firstOrderId ? "View Order" : "View Orders",
                    onPress: () =>
                      count === 1 && firstOrderId
                        ? router.push(`/agrimall/order/${firstOrderId}` as any)
                        : router.push("/agrimall/orders" as any),
                  },
                ],
              );
            } catch (err: any) {
              Alert.alert("Error", buildOrderFailureMessage(err, "Failed to place order"));
            } finally {
              setProcessing(false);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <NeumorphicScreen variant="default">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading checkout…</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────

  if (!cart || cart.items.length === 0) {
    return (
      <NeumorphicScreen variant="default">
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ChevronLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="ghost"
            size="medium"
          />
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <NeumorphicButton
            title="Continue Shopping"
            onPress={() => router.push("/agrimall")}
            variant="primary"
            size="large"
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </NeumorphicScreen>
    );
  }

  const total = parseFloat(checkoutSummary?.pricing.total ?? "0");

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <NeumorphicScreen variant="default">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ChevronLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Insufficient balance warning */}
        {checkoutSummary && !checkoutSummary.wallet.sufficient && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Insufficient wallet balance. You need ${checkoutSummary.wallet.shortfall} more.
            </Text>
            <TouchableOpacity onPress={() => router.push("/wallet" as any)}>
              <Text style={styles.warningLink}>Top Up →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Items */}
        <NeumorphicCard style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({cart.items.length})</Text>
          {cart.items.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.itemImage}>
                {item.product?.images?.[0] ? (
                  <OptimizedImage uri={item.product.images[0]} style={styles.productImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text>🌾</Text>
                  </View>
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product?.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(parseFloat(item.price ?? "0") * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </NeumorphicCard>

        {/* Shipping */}
        <NeumorphicCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={neumorphicColors.primary[600]} />
            <Text style={styles.sectionTitle}>Delivery Information</Text>
          </View>

          <NeumorphicInput
            label="Full Name *"
            value={shippingInfo.fullName}
            onChangeText={(t) => setShippingInfo({ ...shippingInfo, fullName: t })}
            placeholder="John Doe"
          />
          <NeumorphicInput
            label="Phone Number *"
            value={shippingInfo.phone}
            onChangeText={(t) => setShippingInfo({ ...shippingInfo, phone: t })}
            placeholder="+263 77 123 4567"
            keyboardType="phone-pad"
          />
          <NeumorphicInput
            label="Address *"
            value={shippingInfo.address}
            onChangeText={(t) => setShippingInfo({ ...shippingInfo, address: t })}
            placeholder="Street address"
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <NeumorphicInput
                label="City *"
                value={shippingInfo.city}
                onChangeText={(t) => setShippingInfo({ ...shippingInfo, city: t })}
                placeholder="Harare"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <NeumorphicInput
                label="Postal Code"
                value={shippingInfo.postalCode}
                onChangeText={(t) => setShippingInfo({ ...shippingInfo, postalCode: t })}
                placeholder="Optional"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <NeumorphicInput
            label="Delivery Notes"
            value={shippingInfo.notes}
            onChangeText={(t) => setShippingInfo({ ...shippingInfo, notes: t })}
            placeholder="Special instructions…"
            multiline
            numberOfLines={3}
          />
        </NeumorphicCard>

        {/* Payment method — wallet only for Agri-Mall orders */}
        <NeumorphicCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color={neumorphicColors.primary[600]} />
            <Text style={styles.sectionTitle}>Payment</Text>
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Agrivus Wallet</Text>
            <View>
              <Text style={styles.walletBalance}>
                ${checkoutSummary?.wallet.balance ?? "0.00"} available
              </Text>
              {checkoutSummary && !checkoutSummary.wallet.sufficient && (
                <Text style={styles.walletShortfall}>
                  Short by ${checkoutSummary.wallet.shortfall}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.escrowNote}>
            Funds are held in escrow and only released to the vendor after you confirm delivery.
          </Text>
        </NeumorphicCard>

        {/* Order Total */}
        <NeumorphicCard style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${checkoutSummary?.pricing.subtotal ?? "0.00"}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>${checkoutSummary?.pricing.estimatedDeliveryFee ?? "0.00"}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${checkoutSummary?.pricing.total ?? "0.00"}</Text>
          </View>
        </NeumorphicCard>

        {/* Security note */}
        <View style={styles.securityNote}>
          <ShieldCheck size={16} color={neumorphicColors.semantic.success} />
          <Text style={styles.securityText}>Secured by Agrivus Escrow</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* CTA */}
      <NeumorphicCard style={styles.footer} variant="elevated">
        <NeumorphicButton
          title={processing ? "Processing…" : `Place Order — $${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          variant="primary"
          size="large"
          loading={processing}
          disabled={processing || (checkoutSummary ? !checkoutSummary.wallet.sufficient : false)}
        />
      </NeumorphicCard>
    </NeumorphicScreen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText:      { marginTop: spacing.md, ...typography.body, color: neumorphicColors.text.secondary },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.lg },
  headerTitle:      { ...typography.h4, color: neumorphicColors.text.primary },
  emptyContainer:   { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg },
  emptyTitle:       { ...typography.h3, color: neumorphicColors.text.primary },
  scrollView:       { flex: 1 },
  warningBanner: {
    margin:           spacing.lg,
    marginBottom:     0,
    backgroundColor:  "#FEF3C7",
    borderColor:      "#F59E0B",
    borderWidth:      1,
    borderRadius:     borderRadius.md,
    padding:          spacing.md,
    flexDirection:    "row",
    justifyContent:   "space-between",
    alignItems:       "center",
  },
  warningText:  { ...typography.caption, color: "#92400E", flex: 1 },
  warningLink:  { ...typography.caption, color: "#1D4ED8", fontWeight: "600", marginLeft: spacing.sm },
  section:      { margin: spacing.lg, marginBottom: 0, padding: spacing.lg },
  sectionHeader:{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { ...typography.h5, color: neumorphicColors.text.primary },
  orderItem:    { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: neumorphicColors.base.shadowDark },
  itemImage:    { width: 50, height: 50, borderRadius: borderRadius.md, overflow: "hidden" },
  productImage: { width: "100%", height: "100%" },
  placeholderImage: { width: "100%", height: "100%", backgroundColor: neumorphicColors.primary[100], justifyContent: "center", alignItems: "center" },
  itemDetails:  { flex: 1, marginLeft: spacing.md },
  itemName:     { ...typography.body, fontWeight: "500", color: neumorphicColors.text.primary },
  itemQuantity: { ...typography.caption, color: neumorphicColors.text.secondary },
  itemPrice:    { ...typography.body, fontWeight: "600", color: neumorphicColors.text.primary },
  row:          { flexDirection: "row" },
  walletInfo: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    backgroundColor: neumorphicColors.primary[100],
    borderRadius:    borderRadius.md,
    padding:         spacing.md,
    marginBottom:    spacing.sm,
  },
  walletLabel:    { ...typography.body, fontWeight: "600", color: neumorphicColors.text.primary },
  walletBalance:  { ...typography.body, fontWeight: "600", color: neumorphicColors.primary[600], textAlign: "right" },
  walletShortfall:{ ...typography.caption, color: "#DC2626", textAlign: "right" },
  escrowNote:     { ...typography.caption, color: neumorphicColors.text.secondary, marginTop: spacing.sm },
  totalRow:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  totalLabel:     { ...typography.body, color: neumorphicColors.text.secondary },
  totalValue:     { ...typography.body, color: neumorphicColors.text.primary },
  grandTotalRow:  { marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: neumorphicColors.base.shadowDark },
  grandTotalLabel:{ ...typography.h4, color: neumorphicColors.text.primary },
  grandTotalValue:{ ...typography.h3, color: neumorphicColors.primary[600] },
  securityNote:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.lg },
  securityText:   { ...typography.caption, color: neumorphicColors.text.secondary },
  bottomPadding:  { height: spacing["2xl"] },
  footer:         { margin: spacing.lg, marginBottom: spacing.lg, padding: spacing.lg },
});
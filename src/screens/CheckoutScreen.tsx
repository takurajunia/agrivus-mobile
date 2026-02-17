import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Tag,
  Minus,
  Plus,
  Check,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { agrimallService } from "../services/agrimallService";
import type { Cart, CheckoutSummary } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../components/neumorphic/NeumorphicIconButton";
import NeumorphicInput from "../components/neumorphic/NeumorphicInput";

export default function CheckoutScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [checkoutSummary, setCheckoutSummary] =
    useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "card" | "mpesa"
  >("wallet");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

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
      setError(err.response?.data?.message || "Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const validateShipping = () => {
    if (!shippingInfo.fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return false;
    }
    if (!shippingInfo.address.trim()) {
      Alert.alert("Error", "Please enter your address");
      return false;
    }
    if (!shippingInfo.city.trim()) {
      Alert.alert("Error", "Please enter your city");
      return false;
    }
    return true;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      // Simulate promo code application
      setPromoApplied(true);
      Alert.alert("Success", "Promo code applied!");
    } catch (err: any) {
      Alert.alert("Error", "Invalid promo code");
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;

    try {
      setProcessing(true);

      await agrimallService.checkout({
        deliveryAddress: `${shippingInfo.fullName}, ${shippingInfo.phone}, ${
          shippingInfo.address
        }, ${shippingInfo.city}${
          shippingInfo.postalCode ? `, ${shippingInfo.postalCode}` : ""
        }`,
        buyerNotes: shippingInfo.notes || undefined,
      });

      Alert.alert("Success", "Order placed successfully!", [
        { text: "View Orders", onPress: () => router.push("/orders") },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to place order"
      );
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: "wallet", label: "Wallet Balance", icon: CreditCard },
    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
    { id: "mpesa", label: "M-Pesa", icon: CreditCard },
  ] as const;

  if (loading) {
    return (
      <NeumorphicScreen variant="default">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <NeumorphicScreen variant="default">
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={
              <ChevronLeft size={24} color={neumorphicColors.text.primary} />
            }
            onPress={() => router.back()}
            variant="flat"
            size="md"
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
            size="lg"
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="default">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ChevronLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="flat"
          size="md"
        />
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <NeumorphicCard style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.items.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.itemImage}>
                {item.product?.images?.[0] ? (
                  <Image
                    source={{ uri: item.product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
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
                $
                {(
                  parseFloat(item.price || "0") * item.quantity
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
        </NeumorphicCard>

        {/* Shipping Information */}
        <NeumorphicCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={neumorphicColors.primary.main} />
            <Text style={styles.sectionTitle}>Shipping Information</Text>
          </View>

          <NeumorphicInput
            label="Full Name *"
            value={shippingInfo.fullName}
            onChangeText={(text) =>
              setShippingInfo({ ...shippingInfo, fullName: text })
            }
            placeholder="John Doe"
          />

          <NeumorphicInput
            label="Phone Number *"
            value={shippingInfo.phone}
            onChangeText={(text) =>
              setShippingInfo({ ...shippingInfo, phone: text })
            }
            placeholder="+254 700 000 000"
            keyboardType="phone-pad"
          />

          <NeumorphicInput
            label="Address *"
            value={shippingInfo.address}
            onChangeText={(text) =>
              setShippingInfo({ ...shippingInfo, address: text })
            }
            placeholder="Street address"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <NeumorphicInput
                label="City *"
                value={shippingInfo.city}
                onChangeText={(text) =>
                  setShippingInfo({ ...shippingInfo, city: text })
                }
                placeholder="Nairobi"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <NeumorphicInput
                label="Postal Code"
                value={shippingInfo.postalCode}
                onChangeText={(text) =>
                  setShippingInfo({ ...shippingInfo, postalCode: text })
                }
                placeholder="00100"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <NeumorphicInput
            label="Delivery Notes"
            value={shippingInfo.notes}
            onChangeText={(text) =>
              setShippingInfo({ ...shippingInfo, notes: text })
            }
            placeholder="Special delivery instructions..."
            multiline
            numberOfLines={3}
          />
        </NeumorphicCard>
        {/* Payment Method */}
        <NeumorphicCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={neumorphicColors.primary.main} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                paymentMethod === method.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentInfo}>
                <method.icon
                  size={24}
                  color={neumorphicColors.text.secondary}
                />
                <Text style={styles.paymentLabel}>{method.label}</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === method.id && (
                  <Check size={14} color={neumorphicColors.text.inverse} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </NeumorphicCard>

        {/* Promo Code */}
        <NeumorphicCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color={neumorphicColors.primary.main} />
            <Text style={styles.sectionTitle}>Promo Code</Text>
          </View>

          <View style={styles.promoContainer}>
            <View style={{ flex: 1 }}>
              <NeumorphicInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                editable={!promoApplied}
              />
            </View>
            <NeumorphicButton
              title={promoApplied ? "Applied" : "Apply"}
              onPress={handleApplyPromo}
              variant={promoApplied ? "secondary" : "primary"}
              size="md"
              disabled={promoApplied}
              style={{ marginLeft: spacing.md }}
            />
          </View>
        </NeumorphicCard>

        {/* Order Total */}
        <NeumorphicCard style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ${checkoutSummary?.pricing?.subtotal || "0"}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>
              ${checkoutSummary?.pricing?.estimatedDeliveryFee || "0"}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>
              ${checkoutSummary?.pricing?.tax || "0"}
            </Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ${checkoutSummary?.pricing?.total || "0"}
            </Text>
          </View>
        </NeumorphicCard>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <ShieldCheck size={16} color={neumorphicColors.semantic.success} />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <NeumorphicCard style={styles.footer} variant="elevated">
        <NeumorphicButton
          title={
            processing
              ? "Processing..."
              : `Place Order - $${checkoutSummary?.pricing?.total || "0"}`
          }
          onPress={handlePlaceOrder}
          variant="primary"
          size="lg"
          loading={processing}
          disabled={processing}
        />
      </NeumorphicCard>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  headerTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: neumorphicColors.primary.light,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    ...typography.body,
    fontWeight: "500",
    color: neumorphicColors.text.primary,
  },
  itemQuantity: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  itemPrice: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  row: {
    flexDirection: "row",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
    marginBottom: spacing.sm,
    backgroundColor: neumorphicColors.base.card,
  },
  paymentOptionSelected: {
    borderColor: neumorphicColors.primary.main,
    backgroundColor: neumorphicColors.primary.light,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  paymentLabel: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: neumorphicColors.base.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: neumorphicColors.primary.main,
    borderColor: neumorphicColors.primary.main,
  },
  promoContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  totalValue: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  grandTotalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.border,
  },
  grandTotalLabel: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  grandTotalValue: {
    ...typography.h3,
    color: neumorphicColors.primary.main,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  securityText: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  footer: {
    margin: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
});

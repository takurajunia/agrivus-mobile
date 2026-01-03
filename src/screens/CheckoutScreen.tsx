import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
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
import { theme } from "../theme/tokens";
import { agrimallService } from "../services/agrimallService";
import type { Cart, CheckoutSummary } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/agrimall")}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <AnimatedCard style={styles.section}>
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
                ).toLocaleString()}
              </Text>
            </View>
          ))}
        </AnimatedCard>

        {/* Shipping Information */}
        <AnimatedCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={theme.colors.primary[600]} />
            <Text style={styles.sectionTitle}>Shipping Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.fullName}
              onChangeText={(text) =>
                setShippingInfo({ ...shippingInfo, fullName: text })
              }
              placeholder="John Doe"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.phone}
              onChangeText={(text) =>
                setShippingInfo({ ...shippingInfo, phone: text })
              }
              placeholder="+254 700 000 000"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.address}
              onChangeText={(text) =>
                setShippingInfo({ ...shippingInfo, address: text })
              }
              placeholder="Street address"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.city}
                onChangeText={(text) =>
                  setShippingInfo({ ...shippingInfo, city: text })
                }
                placeholder="Nairobi"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>
            <View
              style={[
                styles.inputGroup,
                { flex: 1, marginLeft: theme.spacing.md },
              ]}
            >
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={shippingInfo.postalCode}
                onChangeText={(text) =>
                  setShippingInfo({ ...shippingInfo, postalCode: text })
                }
                placeholder="00100"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={shippingInfo.notes}
              onChangeText={(text) =>
                setShippingInfo({ ...shippingInfo, notes: text })
              }
              placeholder="Special delivery instructions..."
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </AnimatedCard>

        {/* Payment Method */}
        <AnimatedCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={theme.colors.primary[600]} />
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
                <method.icon size={24} color={theme.colors.text.secondary} />
                <Text style={styles.paymentLabel}>{method.label}</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === method.id && (
                  <Check size={14} color={theme.colors.text.inverse} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </AnimatedCard>

        {/* Promo Code */}
        <AnimatedCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color={theme.colors.primary[600]} />
            <Text style={styles.sectionTitle}>Promo Code</Text>
          </View>

          <View style={styles.promoContainer}>
            <TextInput
              style={[styles.input, styles.promoInput]}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter promo code"
              placeholderTextColor={theme.colors.text.tertiary}
              editable={!promoApplied}
            />
            <TouchableOpacity
              style={[
                styles.promoButton,
                promoApplied && styles.promoButtonApplied,
              ]}
              onPress={handleApplyPromo}
              disabled={promoApplied}
            >
              <Text style={styles.promoButtonText}>
                {promoApplied ? "Applied" : "Apply"}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Order Total */}
        <AnimatedCard style={styles.section}>
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
        </AnimatedCard>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <ShieldCheck size={16} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            processing && styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={processing}
        >
          <Text style={styles.placeOrderButtonText}>
            {processing
              ? "Processing..."
              : `Place Order - $${checkoutSummary?.pricing?.total || "0"}`}
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  shopButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  shopButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    marginBottom: 0,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  itemName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  itemQuantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  textArea: {
    height: 80,
  },
  row: {
    flexDirection: "row",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.sm,
  },
  paymentOptionSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  paymentLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  promoContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  promoInput: {
    flex: 1,
  },
  promoButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
  },
  promoButtonApplied: {
    backgroundColor: theme.colors.success,
  },
  promoButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  grandTotalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  grandTotalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  grandTotalValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  securityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  placeOrderButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});

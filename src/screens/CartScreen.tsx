import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import agrimallService from "../services/agrimallService";
import type { Cart, CartItem } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import OptimizedImage from "../components/OptimizedImage";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../components/neumorphic/NeumorphicIconButton";

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await agrimallService.getCart();
      setCart(response.cart);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCart();
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(productId);
      const response = await agrimallService.updateCartItem(
        productId,
        newQuantity
      );
      setCart(response.cart);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update quantity"
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdating(productId);
              const response = await agrimallService.removeFromCart(productId);
              setCart(response.cart);
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to remove item"
              );
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your entire cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await agrimallService.clearCart();
              await loadCart();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to clear cart"
              );
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  if (loading && !refreshing) {
    return (
      <NeumorphicScreen variant="default">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="default">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🛒 Shopping Cart</Text>
          <Text style={styles.subtitle}>
            {isEmpty
              ? "Your cart is empty"
              : `${cartItems.length} item(s) in cart`}
          </Text>
        </View>
        {!isEmpty && (
          <NeumorphicIconButton
            icon={<Trash2 size={20} color={neumorphicColors.semantic.error} />}
            onPress={handleClearCart}
            variant="ghost"
            size="medium"
          />
        )}
      </View>

      {/* Error */}
      {error ? (
        <NeumorphicCard style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            onPress={loadCart}
            variant="secondary"
            size="small"
            style={{ marginTop: spacing.md }}
          />
        </NeumorphicCard>
      ) : null}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={neumorphicColors.text.tertiary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add some products to get started</Text>
          <NeumorphicButton
            title="Browse Products"
            onPress={() => router.push("/agrimall")}
            variant="primary"
            size="large"
            style={{ marginTop: spacing.xl }}
          />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[neumorphicColors.primary[600]]}
              />
            }
          >
            {cartItems.map((item) => (
              <NeumorphicCard key={item.productId} style={styles.cartItem}>
                {/* Product Image */}
                <View style={styles.itemImage}>
                  {item.product.images && item.product.images.length > 0 ? (
                    <OptimizedImage
                      uri={item.product.images[0]}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>📦</Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.vendorName}>
                    Sold by: {item.vendor.storeName}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${item.price} per {item.product.unit}
                  </Text>

                  {!item.available && (
                    <Text style={styles.unavailableText}>
                      ⚠️ Only {item.product.stockQuantity} available
                    </Text>
                  )}
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      (updating === item.productId || item.quantity <= 1) &&
                        styles.quantityButtonDisabled,
                    ]}
                    onPress={() =>
                      handleUpdateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={updating === item.productId || item.quantity <= 1}
                  >
                    <Minus size={16} color={neumorphicColors.text.primary} />
                  </TouchableOpacity>

                  <View style={styles.quantityValue}>
                    {updating === item.productId ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      (updating === item.productId ||
                        item.quantity >= item.product.stockQuantity) &&
                        styles.quantityButtonDisabled,
                    ]}
                    onPress={() =>
                      handleUpdateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={
                      updating === item.productId ||
                      item.quantity >= item.product.stockQuantity
                    }
                  >
                    <Plus size={16} color={neumorphicColors.text.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(item.productId)}
                  >
                    <Trash2 size={18} color={neumorphicColors.semantic.error} />
                  </TouchableOpacity>
                </View>

                {/* Subtotal */}
                <View style={styles.subtotalContainer}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>${item.subtotal}</Text>
                </View>
              </NeumorphicCard>
            ))}

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Checkout Footer */}
          <NeumorphicCard style={styles.footer} variant="elevated">
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${cart?.totalAmount || "0.00"}
              </Text>
            </View>
            <NeumorphicButton
              title="Proceed to Checkout"
              onPress={() => router.push("/agrimall/checkout")}
              variant="primary"
              size="large"
              icon={
                <ArrowRight size={20} color={neumorphicColors.text.inverse} />
              }
              iconPosition="right"
            />
          </NeumorphicCard>
        </>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  errorText: {
    color: neumorphicColors.semantic.error,
    ...typography.body,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: neumorphicColors.base.input,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
  },
  itemInfo: {
    marginLeft: 96,
    minHeight: 80,
  },
  itemName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  vendorName: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
  itemPrice: {
    ...typography.h5,
    color: neumorphicColors.primary[600],
    marginTop: spacing.sm,
  },
  unavailableText: {
    ...typography.caption,
    color: neumorphicColors.semantic.error,
    marginTop: spacing.xs,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    width: 48,
    alignItems: "center",
  },
  quantityText: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  removeButton: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    backgroundColor: neumorphicColors.semantic.error + "15",
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  subtotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark,
  },
  subtotalLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  subtotalValue: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  bottomPadding: {
    height: 180,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h4,
    color: neumorphicColors.text.secondary,
  },
  totalValue: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
});

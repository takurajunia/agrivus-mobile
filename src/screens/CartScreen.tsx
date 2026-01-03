import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
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
import { theme } from "../theme/tokens";
import agrimallService from "../services/agrimallService";
import type { Cart, CartItem } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Trash2 size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCart}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={theme.colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add some products to get started</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/agrimall")}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
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
                colors={[theme.colors.primary[600]]}
              />
            }
          >
            {cartItems.map((item) => (
              <AnimatedCard key={item.productId} style={styles.cartItem}>
                {/* Product Image */}
                <View style={styles.itemImage}>
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={styles.image}
                      resizeMode="cover"
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
                    style={styles.quantityButton}
                    onPress={() =>
                      handleUpdateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={updating === item.productId || item.quantity <= 1}
                  >
                    <Minus size={16} color={theme.colors.text.primary} />
                  </TouchableOpacity>

                  <View style={styles.quantityValue}>
                    {updating === item.productId ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      handleUpdateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={
                      updating === item.productId ||
                      item.quantity >= item.product.stockQuantity
                    }
                  >
                    <Plus size={16} color={theme.colors.text.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(item.productId)}
                  >
                    <Trash2 size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>

                {/* Subtotal */}
                <View style={styles.subtotalContainer}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>${item.subtotal}</Text>
                </View>
              </AnimatedCard>
            ))}

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Checkout Footer */}
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${cart?.totalAmount || "0.00"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => router.push("/agrimall/checkout")}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <ArrowRight size={20} color={theme.colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  clearButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.error + "15",
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.error + "10",
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
  },
  browseButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.background.secondary,
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
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  vendorName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
  },
  unavailableText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    width: 48,
    alignItems: "center",
  },
  quantityText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  removeButton: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    backgroundColor: theme.colors.error + "15",
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  subtotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  subtotalLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  subtotalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.lg,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  checkoutButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
});

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
  Image,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Package,
  Store,
  Star,
  ShoppingCart,
  MessageSquare,
  Phone,
  MapPin,
  Tag,
  Check,
  Plus,
  Minus,
} from "lucide-react-native";
import AnimatedCard from "../../../src/components/AnimatedCard";
import AnimatedButton from "../../../src/components/AnimatedButton";
import GlassCard from "../../../src/components/GlassCard";
import { theme } from "../../../src/theme/tokens";
import agrimallService from "../../../src/services/agrimallService";
import { useAuth } from "../../../src/contexts/AuthContext";
import type { Product } from "../../../src/types";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchProduct = useCallback(
    async (refresh = false) => {
      if (!id) return;

      try {
        if (refresh) {
          setRefreshing(true);
        }

        const response = await agrimallService.getProduct(id);

        if (response.success || response.product) {
          setProduct(response.product || response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch product:", error);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleRefresh = useCallback(() => {
    fetchProduct(true);
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      await agrimallService.addToCart(product.id, quantity);
      Alert.alert(
        "Success! 🛒",
        `${quantity} x ${product.name} added to cart`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => router.push("/cart" as any) },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add to cart"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(
      1,
      Math.min(quantity + delta, product?.stockQuantity || 100)
    );
    setQuantity(newQty);
  };

  const handleContactVendor = () => {
    if (product?.vendor?.id) {
      router.push(`/chat/${product.vendor.id}` as any);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `$${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Product</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Package
            size={64}
            color={theme.colors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The product you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOutOfStock = product.stockQuantity === 0 || !product.isActive;

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
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/cart" as any)}
          style={styles.cartButton}
        >
          <ShoppingCart size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
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
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Package
                size={80}
                color={theme.colors.text.tertiary}
                strokeWidth={1}
              />
            </View>
          )}

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.isFeatured && (
              <View style={[styles.badge, styles.featuredBadge]}>
                <Star size={12} color={theme.colors.warning} />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
            {isOutOfStock && (
              <View style={[styles.badge, styles.outOfStockBadge]}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
          </View>
        </View>

        {/* Thumbnail selector */}
        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailSelected,
                ]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          {product.categoryId && (
            <View style={styles.categoryRow}>
              <Tag size={14} color={theme.colors.text.tertiary} />
              <Text style={styles.categoryText}>{product.categoryId}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <Text style={styles.priceUnit}>per {product.unit}</Text>
          </View>

          {product.rating && parseFloat(product.rating) > 0 && (
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  color={theme.colors.warning}
                  fill={
                    i < Math.round(parseFloat(product.rating))
                      ? theme.colors.warning
                      : "transparent"
                  }
                />
              ))}
              <Text style={styles.ratingText}>
                {parseFloat(product.rating).toFixed(1)} (
                {product.reviewCount || 0} reviews)
              </Text>
            </View>
          )}

          <View style={styles.stockRow}>
            <Package
              size={16}
              color={isOutOfStock ? theme.colors.error : theme.colors.success}
            />
            <Text
              style={[styles.stockText, isOutOfStock && styles.stockTextOut]}
            >
              {isOutOfStock
                ? "Out of Stock"
                : `${product.stockQuantity} in stock`}
            </Text>
          </View>
        </View>

        {/* Description */}
        {product.description && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <AnimatedCard style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </AnimatedCard>
          </>
        )}

        {/* Vendor Info */}
        {product.vendor && (
          <>
            <Text style={styles.sectionTitle}>Seller</Text>
            <AnimatedCard style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                <View style={styles.vendorAvatar}>
                  <Store size={24} color={theme.colors.primary[600]} />
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>
                    {product.vendor.storeName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactVendor}
              >
                <MessageSquare size={18} color={theme.colors.primary[600]} />
                <Text style={styles.contactButtonText}>Contact Seller</Text>
              </TouchableOpacity>
            </AnimatedCard>
          </>
        )}

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <AnimatedCard style={styles.quantityCard}>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(-1)}
                >
                  <Minus size={20} color={theme.colors.primary[600]} />
                </TouchableOpacity>
                <View style={styles.quantityValue}>
                  <Text style={styles.quantityNumber}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(1)}
                >
                  <Plus size={20} color={theme.colors.primary[600]} />
                </TouchableOpacity>
              </View>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>
                  {formatCurrency(parseFloat(String(product.price)) * quantity)}
                </Text>
              </View>
            </AnimatedCard>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <AnimatedButton
          title={
            addingToCart
              ? "Adding..."
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"
          }
          variant="primary"
          size="lg"
          loading={addingToCart}
          disabled={isOutOfStock}
          onPress={handleAddToCart}
        >
          <ShoppingCart size={20} color={theme.colors.text.inverse} />
        </AnimatedButton>
      </View>
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
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: "center",
    marginHorizontal: theme.spacing.md,
  },
  cartButton: {
    padding: theme.spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
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
  imageGallery: {
    width: width,
    height: width * 0.8,
    backgroundColor: theme.colors.background.primary,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.tertiary,
  },
  badgeContainer: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  featuredBadge: {
    backgroundColor: theme.colors.warning + "20",
  },
  featuredBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.warning,
  },
  outOfStockBadge: {
    backgroundColor: theme.colors.error + "20",
  },
  outOfStockText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error,
  },
  thumbnailContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailSelected: {
    borderColor: theme.colors.primary[600],
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
  },
  productName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  price: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  priceUnit: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  stockText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.success,
  },
  stockTextOut: {
    color: theme.colors.error,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  descriptionCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  vendorCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  vendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  vendorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  vendorLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  vendorLocationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  contactButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  },
  quantityCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    minWidth: 60,
    alignItems: "center",
  },
  quantityNumber: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  subtotalLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  subtotalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  bottomPadding: {
    height: theme.spacing["2xl"],
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});

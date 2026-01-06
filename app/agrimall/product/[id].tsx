import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../../src/theme/neumorphic";
import NeumorphicScreen from "../../../src/components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../../../src/components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../../../src/components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../../../src/components/neumorphic/NeumorphicIconButton";
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
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (!product) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="default"
            size="medium"
          />
          <Text style={styles.title}>Product</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Package
            size={64}
            color={neumorphicColors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The product you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </NeumorphicScreen>
    );
  }

  const isOutOfStock = product.stockQuantity === 0 || !product.isActive;

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
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <NeumorphicIconButton
          icon={
            <ShoppingCart size={24} color={neumorphicColors.text.primary} />
          }
          onPress={() => router.push("/cart" as any)}
          variant="default"
          size="medium"
        />
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
                color={neumorphicColors.text.tertiary}
                strokeWidth={1}
              />
            </View>
          )}

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.isFeatured && (
              <View style={[styles.badge, styles.featuredBadge]}>
                <Star size={12} color={neumorphicColors.secondary[500]} />
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
              <NeumorphicCard
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailSelected,
                ]}
                onPress={() => setSelectedImageIndex(index)}
                shadowLevel={1}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </NeumorphicCard>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          {product.categoryId && (
            <View style={styles.categoryRow}>
              <Tag size={14} color={neumorphicColors.text.tertiary} />
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
                  color={neumorphicColors.secondary[500]}
                  fill={
                    i < Math.round(parseFloat(product.rating))
                      ? neumorphicColors.secondary[500]
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
              color={
                isOutOfStock
                  ? neumorphicColors.semantic.error
                  : neumorphicColors.semantic.success
              }
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
            <NeumorphicCard style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </NeumorphicCard>
          </>
        )}

        {/* Vendor Info */}
        {product.vendor && (
          <>
            <Text style={styles.sectionTitle}>Seller</Text>
            <NeumorphicCard style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                <View style={styles.vendorAvatar}>
                  <Store size={24} color={neumorphicColors.primary[600]} />
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>
                    {product.vendor.storeName}
                  </Text>
                </View>
              </View>
              <NeumorphicButton
                title="Contact Seller"
                variant="secondary"
                size="medium"
                icon={
                  <MessageSquare
                    size={18}
                    color={neumorphicColors.primary[600]}
                  />
                }
                onPress={handleContactVendor}
                fullWidth
                style={styles.contactButton}
              />
            </NeumorphicCard>
          </>
        )}

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <NeumorphicCard style={styles.quantityCard}>
              <View style={styles.quantityRow}>
                <NeumorphicIconButton
                  icon={
                    <Minus size={20} color={neumorphicColors.primary[600]} />
                  }
                  onPress={() => handleQuantityChange(-1)}
                  variant="secondary"
                  size="medium"
                />
                <View style={styles.quantityValue}>
                  <Text style={styles.quantityNumber}>{quantity}</Text>
                </View>
                <NeumorphicIconButton
                  icon={
                    <Plus size={20} color={neumorphicColors.primary[600]} />
                  }
                  onPress={() => handleQuantityChange(1)}
                  variant="secondary"
                  size="medium"
                />
              </View>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>
                  {formatCurrency(parseFloat(String(product.price)) * quantity)}
                </Text>
              </View>
            </NeumorphicCard>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <NeumorphicButton
          title={
            addingToCart
              ? "Adding..."
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"
          }
          variant="primary"
          size="large"
          loading={addingToCart}
          disabled={isOutOfStock}
          onPress={handleAddToCart}
          icon={
            <ShoppingCart size={20} color={neumorphicColors.text.inverse} />
          }
          fullWidth
        />
      </View>
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
    backgroundColor: neumorphicColors.base.card,
  },
  title: {
    ...typography.h5,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
  placeholder: {
    width: 48,
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
  imageGallery: {
    width: width,
    height: width * 0.8,
    backgroundColor: neumorphicColors.base.card,
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
    backgroundColor: neumorphicColors.base.input,
  },
  badgeContainer: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  featuredBadge: {
    backgroundColor: neumorphicColors.badge.warning.bg,
  },
  featuredBadgeText: {
    ...typography.caption,
    fontWeight: "600",
    color: neumorphicColors.badge.warning.text,
  },
  outOfStockBadge: {
    backgroundColor: neumorphicColors.badge.error.bg,
  },
  outOfStockText: {
    ...typography.caption,
    fontWeight: "600",
    color: neumorphicColors.badge.error.text,
  },
  thumbnailContainer: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: neumorphicColors.base.card,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    padding: 0,
  },
  thumbnailSelected: {
    borderWidth: 2,
    borderColor: neumorphicColors.primary[600],
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    backgroundColor: neumorphicColors.base.card,
    padding: spacing.lg,
  },
  productName: {
    ...typography.h3,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  categoryText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  price: {
    ...typography.h1,
    color: neumorphicColors.primary[600],
  },
  priceUnit: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  ratingText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.xs,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  stockText: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.semantic.success,
  },
  stockTextOut: {
    color: neumorphicColors.semantic.error,
  },
  sectionTitle: {
    ...typography.h5,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  descriptionCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  descriptionText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    lineHeight: 24,
  },
  vendorCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  vendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  vendorAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.h6,
  },
  vendorLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  vendorLocationText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
  },
  contactButton: {
    marginTop: spacing.md,
  },
  quantityCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  quantityValue: {
    minWidth: 60,
    alignItems: "center",
  },
  quantityNumber: {
    ...typography.h1,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  subtotalLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  subtotalValue: {
    ...typography.h5,
    color: neumorphicColors.primary[600],
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: neumorphicColors.base.card,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
});

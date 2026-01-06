import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ShoppingCart,
  Star,
  Package,
  Store,
  Plus,
  ClipboardList,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";
import agrimallService from "../services/agrimallService";
import type { Product, Cart } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicIconButton from "../components/neumorphic/NeumorphicIconButton";
import NeumorphicSearchBar from "../components/neumorphic/NeumorphicSearchBar";
import NeumorphicBadge from "../components/neumorphic/NeumorphicBadge";

export default function AgriMallScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProducts();
    loadCartCount();
  }, [search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await agrimallService.getProducts({ search, limit: 50 });
      setProducts(response.products || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const response = await agrimallService.getCart();
      setCartCount(response.cart?.items?.length || 0);
    } catch (err) {
      // Ignore cart errors
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
    loadCartCount();
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      await agrimallService.addToCart(productId, 1);
      Alert.alert("Success", "Added to cart!");
      loadCartCount();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to add to cart"
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    return (
      <NeumorphicCard
        style={styles.productCard}
        onPress={() => router.push(`/agrimall/product/${item.id}`)}
        variant="standard"
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Package size={40} color={neumorphicColors.text.tertiary} />
            </View>
          )}
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <NeumorphicBadge
                label="Featured"
                variant="warning"
                size="small"
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {item.vendor && (
            <View style={styles.vendorRow}>
              <Store size={12} color={neumorphicColors.text.tertiary} />
              <Text style={styles.vendorName}>{item.vendor.storeName}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.unit}>per {item.unit}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.stockText}>Stock: {item.stockQuantity}</Text>
            {item.rating !== "0.00" && (
              <View style={styles.ratingContainer}>
                <Star size={12} color={neumorphicColors.secondary[500]} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          {/* Add to Cart Button */}
          <NeumorphicButton
            title={item.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            onPress={() => handleAddToCart(item.id)}
            variant={
              item.stockQuantity === 0 || !item.isActive
                ? "tertiary"
                : "primary"
            }
            size="small"
            disabled={
              item.stockQuantity === 0 ||
              !item.isActive ||
              addingToCart === item.id
            }
            loading={addingToCart === item.id}
            icon={<Plus size={16} color={neumorphicColors.text.inverse} />}
            style={styles.addButton}
            fullWidth
          />
        </View>
      </NeumorphicCard>
    );
  };

  return (
    <NeumorphicScreen variant="list" showLeaves>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🛒 Virtual Agri-Mall</Text>
          <Text style={styles.subtitle}>
            Agricultural inputs, seeds & equipment
          </Text>
        </View>
        <View style={styles.headerActions}>
          <NeumorphicIconButton
            icon={
              <ClipboardList size={24} color={neumorphicColors.primary[600]} />
            }
            onPress={() => router.push("/agrimall/orders")}
            variant="default"
          />
          <NeumorphicIconButton
            icon={
              <ShoppingCart size={24} color={neumorphicColors.text.inverse} />
            }
            onPress={() => router.push("/cart")}
            variant="primary"
            badge={cartCount}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
        />
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeumorphicButton
            title="Retry"
            onPress={loadProducts}
            variant="danger"
            size="small"
          />
        </View>
      ) : null}

      {/* Products */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[neumorphicColors.primary[600]]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={neumorphicColors.text.tertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: neumorphicColors.badge.error.bg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  errorText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    padding: 0,
  },
  imageContainer: {
    position: "relative",
    height: 120,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: neumorphicColors.base.background,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
  productName: {
    ...typography.h6,
    color: neumorphicColors.text.primary,
    lineHeight: 20,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: 4,
  },
  vendorName: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.sm,
  },
  price: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
  },
  unit: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  stockText: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    ...typography.caption,
    color: neumorphicColors.secondary[600],
  },
  addButton: {
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
  },
});

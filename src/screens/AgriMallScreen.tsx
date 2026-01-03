import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  ShoppingCart,
  Star,
  Package,
  Store,
  Plus,
  ClipboardList,
} from "lucide-react-native";
import { theme } from "../theme/tokens";
import agrimallService from "../services/agrimallService";
import type { Product, Cart } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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
      <AnimatedCard
        style={styles.productCard}
        onPress={() => router.push(`/agrimall/product/${item.id}`)}
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
              <Package size={40} color={theme.colors.text.tertiary} />
            </View>
          )}
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
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
              <Store size={12} color={theme.colors.text.tertiary} />
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
                <Star size={12} color={theme.colors.secondary[500]} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              (item.stockQuantity === 0 || !item.isActive) &&
                styles.addButtonDisabled,
            ]}
            onPress={() => handleAddToCart(item.id)}
            disabled={
              item.stockQuantity === 0 ||
              !item.isActive ||
              addingToCart === item.id
            }
          >
            {addingToCart === item.id ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <Plus size={16} color={theme.colors.text.inverse} />
                <Text style={styles.addButtonText}>
                  {item.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🛒 Virtual Agri-Mall</Text>
          <Text style={styles.subtitle}>
            Agricultural inputs, seeds & equipment
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.push("/agrimall/orders")}
          >
            <ClipboardList size={24} color={theme.colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
          >
            <ShoppingCart size={24} color={theme.colors.text.inverse} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
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
              colors={[theme.colors.primary[600]]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try a different search term</Text>
            </View>
          }
        />
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  ordersButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  cartButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.md,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
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
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  columnWrapper: {
    gap: theme.spacing.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
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
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.secondary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  featuredText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  productName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
    gap: 4,
  },
  vendorName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: theme.spacing.sm,
  },
  price: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  unit: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  stockText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
});

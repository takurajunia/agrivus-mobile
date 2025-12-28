import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import agrimallService from "../services/agrimallService";
import type { Product } from "../services/agrimallService";
import { Card, Button, LoadingSpinner } from "../components/common";

export default function AgriMallProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await agrimallService.getProducts({ search, limit: 50 });
      setProducts(response.products || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      await agrimallService.addToCart(productId, 1);
      setSuccessMessage("Added to cart!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛒 Virtual Agri-Mall
        </h1>
        <p className="text-gray-600">
          Browse agricultural inputs, seeds, fertilizers, and equipment
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✓ {successMessage}
        </div>
      )}

      {/* Search & Actions */}
      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Link to="/agrimall/cart">
          <Button variant="primary">🛒 View Cart</Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col h-full">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                {product.isFeatured && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Vendor */}
                {product.vendor && (
                  <p className="text-xs text-gray-500 mb-2">
                    by {product.vendor.storeName}
                  </p>
                )}

                {/* Price & Stock */}
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      per {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Stock: {product.stockQuantity}
                    </span>
                    {product.rating !== "0.00" && (
                      <span className="text-sm text-yellow-600">
                        ⭐ {product.rating}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={
                        product.stockQuantity === 0 ||
                        !product.isActive ||
                        addingToCart === product.id
                      }
                      className="flex-1"
                      variant={
                        product.stockQuantity > 0 ? "primary" : "outline"
                      }
                    >
                      {addingToCart === product.id ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Adding...</span>
                        </>
                      ) : product.stockQuantity === 0 ? (
                        "Out of Stock"
                      ) : (
                        "Add to Cart"
                      )}
                    </Button>
                    <Link to={`/agrimall/products/${product.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import agrimallService from "../services/agrimallService";
import type { Cart as CartType } from "../services/agrimallService";
import { Button, LoadingSpinner, Card } from "../components/common";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await agrimallService.getCart();
      setCart(response.cart);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      setUpdating(productId);
      const response = await agrimallService.updateCartItem(
        productId,
        newQuantity
      );
      setCart(response.cart);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!confirm("Remove this item from cart?")) return;

    try {
      setUpdating(productId);
      const response = await agrimallService.removeFromCart(productId);
      setCart(response.cart);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Clear entire cart?")) return;

    try {
      setLoading(true);
      await agrimallService.clearCart();
      await loadCart();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to clear cart");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛒 Shopping Cart
          </h1>
          <p className="text-gray-600">
            {isEmpty
              ? "Your cart is empty"
              : `${cartItems.length} item(s) in cart`}
          </p>
        </div>
        {!isEmpty && (
          <Button variant="outline" onClick={handleClearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isEmpty ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link to="/agrimall/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId} className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Sold by: {item.vendor.storeName}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${item.price} per {item.product.unit}
                    </p>

                    {/* Availability Warning */}
                    {!item.available && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Only {item.product.stockQuantity} available
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          updating === item.productId || item.quantity <= 1
                        }
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {updating === item.productId ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          updating === item.productId ||
                          item.quantity >= item.product.stockQuantity
                        }
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-gray-900">
                      Subtotal: ${item.subtotal}
                    </p>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={updating === item.productId}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${cart?.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery:</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${cart?.totalAmount}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mb-3"
                onClick={() => navigate("/agrimall/checkout")}
              >
                Proceed to Checkout
              </Button>

              <Link to="/agrimall/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

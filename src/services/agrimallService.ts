import api, { getWithCache } from "./api";
import type {
  Product,
  Cart,
  CartItem,
  CheckoutSummary,
  AgrimallOrder,
} from "../types";

export const agrimallService = {
  // ==================== PRODUCTS ====================

  // Get all products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    vendorId?: string;
  }, options?: { forceRefresh?: boolean }) {
    const response = await getWithCache<{
      success: boolean;
      products: Product[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
      };
    }>(
      "/agrimall/products",
      { params },
      {
        ttlMs: 2 * 60 * 1000,
        forceRefresh: options?.forceRefresh,
      }
    );
    return response;
  },

  // Get single product
  async getProduct(productId: string) {
    const response = await api.get(`/agrimall/products/${productId}`);
    return response.data;
  },

  // Get vendor's products
  async getVendorProducts() {
    const response = await api.get("/agrimall/products/my-products");
    return response.data;
  },

  // ==================== CART ====================

  // Get cart
  async getCart(): Promise<{ cart: Cart }> {
    const response = await api.get("/agrimall/cart");
    return response.data;
  },

  // Add to cart
  async addToCart(productId: string, quantity: number = 1) {
    const response = await api.post("/agrimall/cart", { productId, quantity });
    return response.data;
  },

  // Update cart item
  async updateCartItem(productId: string, quantity: number) {
    const response = await api.put(`/agrimall/cart/${productId}`, { quantity });
    return response.data;
  },

  // Remove from cart
  async removeFromCart(productId: string) {
    const response = await api.delete(`/agrimall/cart/${productId}`);
    return response.data;
  },

  // Clear cart
  async clearCart() {
    const response = await api.delete("/agrimall/cart-clear");
    return response.data;
  },

  // ==================== CHECKOUT ====================

  // Get checkout summary
  async getCheckoutSummary(): Promise<{ data: CheckoutSummary }> {
    const response = await api.get("/agrimall/checkout/summary");
    return response.data;
  },

  // Get available transporters
  async getTransporters(deliveryLocation: string) {
    const response = await api.get("/agrimall/checkout/transporters", {
      params: { deliveryLocation },
    });
    return response.data;
  },

  // Process checkout
  async checkout(data: {
    deliveryAddress: string;
    deliveryMethod?: string;
    transporterId?: string;
    deliveryFee?: number;
    buyerNotes?: string;
  }) {
    const response = await api.post("/agrimall/checkout", data);
    return response.data;
  },

  // ==================== ORDERS ====================

  // Get orders
  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    const response = await api.get("/agrimall/orders", { params });
    return response.data;
  },

  // Get order by ID
  async getOrder(orderId: string) {
    const response = await api.get(`/agrimall/orders/${orderId}`);
    return response.data;
  },

  // Update order status (vendor only)
  async updateOrderStatus(
    orderId: string,
    status: string,
    vendorNotes?: string
  ) {
    const response = await api.put(`/agrimall/orders/${orderId}/status`, {
      status,
      vendorNotes,
    });
    return response.data;
  },

  // Confirm delivery (buyer only)
  async confirmDelivery(orderId: string, rating?: number, feedback?: string) {
    const response = await api.post(`/agrimall/orders/${orderId}/confirm`, {
      rating,
      feedback,
    });
    return response.data;
  },

  // Cancel order
  async cancelOrder(orderId: string, cancelReason?: string) {
    const response = await api.post(`/agrimall/orders/${orderId}/cancel`, {
      cancelReason,
    });
    return response.data;
  },

  // ==================== VENDORS ====================

  // Get all vendors
  async getVendors(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await api.get("/agrimall/vendors", { params });
    return response.data;
  },

  // Get vendor by ID
  async getVendor(vendorId: string) {
    const response = await api.get(`/agrimall/vendors/${vendorId}`);
    return response.data;
  },
};

export default agrimallService;

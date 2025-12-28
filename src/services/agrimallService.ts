import api from "./api";

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  unit: string;
  brand: string | null;
  images: string[];
  rating: string;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  vendor?: {
    id: string;
    storeName: string;
    rating: string;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: string;
  subtotal: string;
  product: {
    id: string;
    name: string;
    images: string[];
    stockQuantity: number;
    unit: string;
  };
  vendor: {
    id: string;
    storeName: string;
    phone: string;
    deliveryAreas: string[];
  };
  available: boolean;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSummary {
  cart: {
    id: string;
    items: CartItem[];
    itemCount: number;
  };
  pricing: {
    subtotal: string;
    estimatedDeliveryFee: string;
    tax: string;
    total: string;
  };
  availability: {
    allAvailable: boolean;
    unavailableItems: any[];
  };
  wallet: {
    balance: string;
    sufficient: boolean;
    shortfall: string;
  };
}

export interface Transporter {
  transporterId: string;
  transporter: {
    fullName: string;
    phone: string;
    platformScore: number;
    vehicleType: string;
    vehicleCapacity: string;
    baseLocation: string;
    rating: string;
    completedDeliveries: number;
    onTimeDeliveryRate: string;
  };
  matchScore: number;
  estimatedDeliveryFee: string;
  estimatedDeliveryTime: string;
  matchReasons: {
    highPlatformActivity: boolean;
    serviceAreaMatch: boolean;
    goodRating: boolean;
    experienced: boolean;
  };
}

export interface AgrimallOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  vendorId: string;
  items: any[];
  subtotal: string;
  deliveryFee: string;
  totalAmount: string;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PRODUCTS ====================

export const agrimallService = {
  // Get all products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    vendorId?: string;
  }) {
    const response = await api.get("/agrimall/products", { params });
    return response.data;
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
  async getCart() {
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
  async getCheckoutSummary() {
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

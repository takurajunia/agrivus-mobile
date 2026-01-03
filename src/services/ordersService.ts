import api from "./api";
import type {
  Order,
  OrderFilters,
  OrderStatus,
  TransporterMatch,
} from "../types";

export interface CreateOrderData {
  listingId: string;
  quantity: string;
  deliveryLocation: string;
  notes?: string;
  usesTransport?: boolean;
}

export interface AssignTransporterData {
  transporterId: string;
  transportCost: string;
  pickupLocation?: string;
}

export interface OrderWithDetails extends Order {
  listing?: {
    id: string;
    cropType: string;
    cropName?: string;
    pricePerUnit: string;
    unit: string;
    images?: string[];
  };
  buyer?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  farmer?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  transportAssignment?: {
    id: string;
    transporterId: string;
    transportCost: string;
    status: string;
    pickupTime?: string;
    deliveryTime?: string;
    transporter?: {
      fullName: string;
      phone: string;
    };
  };
}

const ordersService = {
  // Create a new order (buyers only)
  async createOrder(
    data: CreateOrderData
  ): Promise<{ success: boolean; data: Order }> {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Get all orders for current user (role-filtered)
  async getOrders(filters?: OrderFilters): Promise<{
    success: boolean;
    data: {
      orders: OrderWithDetails[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get single order by ID with full details
  async getOrderById(
    id: string
  ): Promise<{ success: boolean; data: OrderWithDetails }> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // AI-powered transporter matching (farmers only)
  async matchTransporter(orderId: string): Promise<{
    success: boolean;
    data: {
      orderId: string;
      pickupLocation: string;
      deliveryLocation: string;
      matches: TransporterMatch[];
    };
  }> {
    const response = await api.get(`/orders/${orderId}/match-transporter`);
    return response.data;
  },

  // Assign transporter to order (farmers only)
  async assignTransporter(
    orderId: string,
    data: AssignTransporterData
  ): Promise<{ success: boolean; data: Order }> {
    const response = await api.post(
      `/orders/${orderId}/assign-transporter`,
      data
    );
    return response.data;
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<{ success: boolean; data: Order }> {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Confirm delivery (buyers only) - releases escrow
  async confirmDelivery(
    orderId: string
  ): Promise<{ success: boolean; data: Order }> {
    const response = await api.post(`/orders/${orderId}/confirm-delivery`);
    return response.data;
  },

  // Cancel order
  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; data: Order }> {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

export default ordersService;

import api from "./api";
import type {
  ApiResponse,
  Order,
  OrderFilters,
  TransporterMatch,
} from "../types";

export const ordersService = {
  // Create order (buyers only)
  createOrder: async (data: {
    listingId: string;
    quantity: string;
    deliveryLocation: string;
    notes?: string;
    usesTransport?: boolean;
  }) => {
    const response = await api.post<ApiResponse<Order>>("/orders", data);
    return response.data;
  },

  // Get all orders (role-filtered)
  getOrders: async (filters?: OrderFilters) => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get<
      ApiResponse<{
        orders: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(`/orders?${params.toString()}`);

    return response.data;
  },

  // Get single order by ID
  getOrderById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/orders/${id}`);
    return response.data;
  },

  // Match transporter (farmers only)
  matchTransporter: async (orderId: string) => {
    const response = await api.get<
      ApiResponse<{
        orderId: string;
        pickupLocation: string;
        deliveryLocation: string;
        matches: TransporterMatch[];
      }>
    >(`/orders/${orderId}/match-transporter`);
    return response.data;
  },

  // Assign transporter (farmers only)
  assignTransporter: async (
    orderId: string,
    data: {
      transporterId: string;
      transportCost: string;
      pickupLocation?: string;
    }
  ) => {
    const response = await api.post<ApiResponse<any>>(
      `/orders/${orderId}/assign-transporter`,
      data
    );
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status }
    );
    return response.data;
  },

  // Confirm delivery (buyers only)
  confirmDelivery: async (orderId: string) => {
    const response = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/confirm-delivery`
    );
    return response.data;
  },
};

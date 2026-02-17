import api from "./api";
import type { User, Order, Transaction } from "../types";

// Admin Statistics Types
export interface AdminStatistics {
  overview: {
    totalUsers: number;
    totalListings: number;
    totalOrders: number;
    totalVolume: number;
  };
  users: Array<{ role: string; count: number }>;
  orders: Array<{ status: string; count: number }>;
  revenue: {
    total_commission?: number | string;
    total_transport_fees?: number | string;
    total_transactions?: number;
    total_volume?: number | string;
  };
  recentOrders: any[];
  recentActivity: any[];
  platformHealth: {
    activeUsers: number;
    pendingOrders: number;
    securityAlerts: number;
  };
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status?: "pending" | "resolved" | "dismissed";
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  location?: string;
  metadata?: any;
  resolvedAt?: string;
  createdAt: string;
}

export interface RevenueReport {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: string;
    marketplace: string;
    agrimall: string;
    auctions: string;
    exports?: string;
  };
  growth: {
    percentageChange: string;
    trend: "up" | "down" | "stable";
  };
  breakdown: {
    date: string;
    amount: string;
    marketplace?: number;
    auctions?: number;
    exports?: number;
    agrimall?: number;
  }[];
  // Extended properties for UI
  totalRevenue?: number;
  revenueChange?: number;
  platformFees?: number;
  feesChange?: number;
  totalOrders?: number;
  ordersChange?: number;
  averageOrderValue?: number;
  aovChange?: number;
  dailyRevenue?: { date: string; value: number; label: string }[];
  topProducts?: { name: string; sales: number; revenue: number }[];
  topCategories?: { name: string; percentage: number }[];
}

export interface UserWithDetails extends User {
  profile?: any;
  listingsCount?: number;
  ordersCount?: number;
  totalVolume?: string;
}

const adminService = {
  // Get platform-wide statistics
  async getStatistics(): Promise<{ success: boolean; data: AdminStatistics }> {
    const response = await api.get("/admin/statistics");
    return response.data;
  },

  // Get all users with optional filtering
  async getAllUsers(params?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data: {
      users: UserWithDetails[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  // Get single user details
  async getUserDetails(
    userId: string
  ): Promise<{ success: boolean; data: UserWithDetails }> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user status (suspend/activate)
  async updateUserStatus(
    userId: string,
    isActive: boolean,
    reason?: string
  ): Promise<{ success: boolean; data: User }> {
    const response = await api.put(`/admin/users/${userId}/status`, {
      isActive,
      reason,
    });
    return response.data;
  },

  // Get user boost information
  async getUserBoostInfo(userId: string): Promise<{
    success: boolean;
    data: {
      platformScore: number;
      boostMultiplier: string;
      streakDays: number;
      recentTransactions7d: number;
      recentTransactions30d: number;
      tier: string;
    };
  }> {
    const response = await api.get(`/admin/users/${userId}/boost`);
    return response.data;
  },

  // Get all orders (admin view)
  async getAllOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data: {
      orders: Order[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  },

  // Get all transactions
  async getAllTransactions(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data: {
      transactions: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      totalVolume?: string | number;
    };
  }> {
    const response = await api.get("/admin/transactions", { params });
    return response.data;
  },

  // Get security incidents
  async getSecurityIncidents(params?: {
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      incidents: SecurityIncident[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      stats?: {
        total: number;
        open: number;
        resolved: number;
        critical: number;
      };
    };
  }> {
    const response = await api.get("/admin/security-incidents", { params });
    return response.data;
  },

  // Get revenue report
  async getRevenueReport(
    periodOrStartDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; data: RevenueReport }> {
    // Support both period strings (week, month, quarter, year) and date range
    const params: Record<string, string> = {};
    if (periodOrStartDate) {
      if (["week", "month", "quarter", "year"].includes(periodOrStartDate)) {
        params.period = periodOrStartDate;
      } else {
        params.startDate = periodOrStartDate;
        if (endDate) params.endDate = endDate;
      }
    }
    const response = await api.get("/admin/revenue-report", { params });
    return response.data;
  },

  // Export data as CSV
  async exportData(
    type: "users" | "orders" | "revenue",
    formatOrStartDate?: string,
    options?: { period?: string; startDate?: string; endDate?: string } | string
  ): Promise<{ success: boolean; data: { url: string } }> {
    // Support both old (startDate, endDate) and new (format, {period}) signatures
    const params: Record<string, string> = { type };
    if (formatOrStartDate) {
      if (["csv", "pdf", "excel"].includes(formatOrStartDate)) {
        params.format = formatOrStartDate;
      } else {
        params.startDate = formatOrStartDate;
      }
    }
    if (typeof options === "string") {
      params.endDate = options;
    } else if (options) {
      if (options.period) params.period = options.period;
      if (options.startDate) params.startDate = options.startDate;
      if (options.endDate) params.endDate = options.endDate;
    }
    const response = await api.get("/admin/export", { params });
    return response.data;
  },
};

export default adminService;

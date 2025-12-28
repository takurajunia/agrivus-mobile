import api from "./api";

// Get admin dashboard statistics
export const getAdminStats = async () => {
  const response = await api.get("/admin/statistics");
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async (params?: {
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

// Get user details
export const getUserDetails = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

// Update user status (suspend/activate)
export const updateUserStatus = async (
  userId: string,
  isActive: boolean,
  reason?: string
) => {
  const response = await api.put(`/admin/users/${userId}/status`, {
    isActive,
    reason,
  });
  return response.data;
};

// Get user boost info
export const getUserBoostInfo = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}/boost`);
  return response.data;
};

// Get all orders (admin only)
export const getAllOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await api.get("/admin/orders", { params });
  return response.data;
};

// Get all transactions
export const getAllTransactions = async (params?: {
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/admin/transactions", { params });
  return response.data;
};

// Get security incidents
export const getSecurityIncidents = async (params?: {
  severity?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/admin/security-incidents", { params });
  return response.data;
};

// Get revenue report
export const getRevenueReport = async (
  startDate?: string,
  endDate?: string
) => {
  const response = await api.get("/admin/revenue-report", {
    params: { startDate, endDate },
  });
  return response.data;
};

// Export data
export const exportData = async (
  type: "users" | "orders" | "revenue",
  startDate?: string,
  endDate?: string
) => {
  const response = await api.get("/admin/export", {
    params: { type, startDate, endDate },
  });
  return response.data;
};

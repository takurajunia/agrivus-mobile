import api from "./api";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: "low" | "medium" | "high";
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

// Get user notifications
export const getNotifications = async (
  unreadOnly: boolean = false,
  limit: number = 50,
  offset: number = 0
): Promise<NotificationsResponse> => {
  const response = await api.get("/notifications", {
    params: { unreadOnly, limit, offset },
  });
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

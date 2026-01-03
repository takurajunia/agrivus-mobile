import api from "./api";
import type { Notification } from "../types";

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const notificationsService = {
  // Get all notifications with optional filtering
  async getNotifications(
    unreadOnly: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationsResponse> {
    const response = await api.get("/notifications", {
      params: { unreadOnly, limit, offset },
    });
    return response.data;
  },

  // Get unread count only
  async getUnreadCount(): Promise<{
    success: boolean;
    data: { unreadCount: number };
  }> {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  // Mark a single notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  // Delete a notification
  async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean }> {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationsService;

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { wsService } from "../services/websocket";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationsService";
import type { Notification as NotificationType } from "../services/notificationsService";
import { useAuth } from "./AuthContext";

interface NotificationsContextType {
  notifications: NotificationType[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotificationById: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Mark notification as read
  const markNotificationAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const deleteNotificationById = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setUnreadCount((prev) => {
        const deletedNotif = notifications.find((n) => n.id === id);
        return deletedNotif && !deletedNotif.isRead
          ? Math.max(0, prev - 1)
          : prev;
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Initialize WebSocket and fetch notifications
  useEffect(() => {
    if (user && token) {
      // Connect WebSocket
      wsService.connect(token);

      // Fetch initial notifications
      fetchNotifications();

      // Listen for real-time notifications
      wsService.onNotification((notification: NotificationType) => {
        console.log("📬 New notification received:", notification);

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev]);

        // Increment unread count
        if (!notification.isRead) {
          setUnreadCount((prev) => prev + 1);
        }

        // Show browser notification (if permission granted)
        if (
          "Notification" in window &&
          window.Notification.permission === "granted"
        ) {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: "/logo.png",
            badge: "/logo.png",
          });
        }
      });

      // Keep connection alive
      const pingInterval = setInterval(() => {
        wsService.ping();
      }, 30000); // Ping every 30 seconds

      return () => {
        clearInterval(pingInterval);
        wsService.disconnect();
      };
    }
  }, [user, token, fetchNotifications]);

  // Request browser notification permission
  useEffect(() => {
    if (
      "Notification" in window &&
      window.Notification.permission === "default"
    ) {
      window.Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotificationById,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return context;
};

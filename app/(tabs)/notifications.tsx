import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Bell,
  Package,
  DollarSign,
  Gavel,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  Truck,
  CheckCircle,
  User,
  Trash2,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
} from "../../src/components/neumorphic";
import notificationsService from "../../src/services/notificationsService";
import type { Notification } from "../../src/types";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsService.getNotifications(
        false,
        50,
        0
      );
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
      Alert.alert("Error", "Failed to mark notifications as read");
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications(
          notifications.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    // Navigate based on notification type and data
    // This can be expanded to navigate to relevant screens
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationsService.deleteNotification(notificationId);
              const deleted = notifications.find(
                (n) => n.id === notificationId
              );
              setNotifications(
                notifications.filter((n) => n.id !== notificationId)
              );
              if (deleted && !deleted.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }
            } catch (error) {
              console.error("Error deleting notification:", error);
              Alert.alert("Error", "Failed to delete notification");
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
      case "order_placed":
      case "order_received":
        return ShoppingCart;
      case "order_update":
      case "order_delivered":
        return Package;
      case "bid":
      case "auction":
      case "auction_won":
      case "auction_outbid":
        return Gavel;
      case "payment":
      case "payment_received":
      case "wallet":
        return DollarSign;
      case "transport":
      case "delivery":
        return Truck;
      case "message":
      case "chat":
        return MessageCircle;
      case "alert":
      case "warning":
        return AlertCircle;
      case "success":
        return CheckCircle;
      case "user":
      case "profile":
        return User;
      case "price_alert":
      case "market":
        return TrendingUp;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
      case "order_placed":
      case "order_received":
      case "success":
      case "order_delivered":
        return neumorphicColors.semantic.success;
      case "bid":
      case "auction":
      case "auction_won":
      case "auction_outbid":
        return neumorphicColors.semantic.warning;
      case "payment":
      case "payment_received":
      case "wallet":
        return neumorphicColors.semantic.info;
      case "alert":
      case "warning":
        return neumorphicColors.semantic.error;
      case "message":
      case "chat":
        return neumorphicColors.primary[600];
      default:
        return neumorphicColors.secondary[600];
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="list">
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={true}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <NeumorphicButton
            title="Mark all read"
            variant="tertiary"
            size="small"
            onPress={handleMarkAllRead}
          />
        )}
      </View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color={neumorphicColors.text.tertiary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification, index) => {
            const IconComponent = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);

            return (
              <NeumorphicCard
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadCard,
                ]}
                animationDelay={index * 50}
                onPress={() => handleNotificationPress(notification)}
                variant="standard"
              >
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${iconColor}20` },
                    ]}
                  >
                    <IconComponent
                      size={24}
                      color={iconColor}
                      strokeWidth={2}
                    />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.createdAt)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 size={18} color={neumorphicColors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </NeumorphicCard>
            );
          })
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.semantic.success,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  notificationCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: neumorphicColors.semantic.success,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.semantic.success,
    marginLeft: spacing.sm,
  },
  notificationMessage: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  notificationTime: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    fontWeight: "500",
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

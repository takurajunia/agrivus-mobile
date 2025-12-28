import React, { useState } from "react";
import { useNotifications } from "../contexts/NotificationsContext";
import { LoadingSpinner } from "../components/common";

const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_created":
        return { icon: "🛒", color: "text-blue-600", bg: "bg-blue-100" };
      case "order_status_changed":
        return { icon: "📦", color: "text-purple-600", bg: "bg-purple-100" };
      case "payment_received":
        return { icon: "💰", color: "text-green-600", bg: "bg-green-100" };
      case "transport_assigned":
        return { icon: "🚚", color: "text-yellow-600", bg: "bg-yellow-100" };
      case "delivery_confirmed":
        return { icon: "✅", color: "text-green-600", bg: "bg-green-100" };
      case "new_message":
        return { icon: "💬", color: "text-indigo-600", bg: "bg-indigo-100" };
      case "auction_bid":
        return { icon: "🔨", color: "text-orange-600", bg: "bg-orange-100" };
      case "auction_won":
        return { icon: "🏆", color: "text-yellow-600", bg: "bg-yellow-100" };
      default:
        return { icon: "🔔", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo = "";
    if (diffMins < 1) timeAgo = "Just now";
    else if (diffMins < 60)
      timeAgo = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    else if (diffHours < 24)
      timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    else if (diffDays < 7)
      timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    else timeAgo = date.toLocaleDateString();

    const fullDate = date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return { timeAgo, fullDate };
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markNotificationAsRead(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up!"}
              </p>
            </div>

            {/* Notification Bell Icon */}
            <div className="text-5xl">🔔</div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "All your notifications have been read."
                  : "You'll see notifications here as they come in."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { icon, bg } = getNotificationIcon(notification.type);
              const { timeAgo, fullDate } = formatDateTime(
                notification.createdAt
              );

              return (
                <div
                  key={notification.id}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.isRead
                    )
                  }
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                    !notification.isRead
                      ? "border-l-4 border-l-green-500 bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div
                      className={`${bg} w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-gray-700">
                            {notification.message}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationById(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                          title="Delete notification"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span title={fullDate}>⏰ {timeAgo}</span>

                        {notification.priority === "high" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔥 Urgent
                          </span>
                        )}

                        {notification.priority === "medium" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠️ Important
                          </span>
                        )}

                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            • New
                          </span>
                        )}
                      </div>

                      {/* Additional Data (if available) */}
                      {notification.data && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Order ID:</strong>{" "}
                            <code className="text-xs bg-white px-2 py-1 rounded">
                              {notification.data.orderId?.substring(0, 8)}...
                            </code>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Placeholder (for future implementation) */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p className="text-sm">
              Showing {filteredNotifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

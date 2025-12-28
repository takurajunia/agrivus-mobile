import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Bell,
  Package,
  DollarSign,
  Gavel,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'John Farms Co. placed an order for 500kg Organic Tomatoes',
      time: '5 minutes ago',
      unread: true,
      icon: ShoppingCart,
      color: '#2E7D32',
    },
    {
      id: 2,
      type: 'bid',
      title: 'Auction Bid Placed',
      message: 'Someone bid $850 on your Fresh Carrots auction',
      time: '1 hour ago',
      unread: true,
      icon: Gavel,
      color: '#F57C00',
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $1,250 has been credited to your account',
      time: '2 hours ago',
      unread: true,
      icon: DollarSign,
      color: '#1976D2',
    },
    {
      id: 4,
      type: 'stock',
      title: 'Low Stock Alert',
      message: '3 products are running low on stock. Restock soon!',
      time: '3 hours ago',
      unread: false,
      icon: AlertCircle,
      color: '#D32F2F',
    },
    {
      id: 5,
      type: 'listing',
      title: 'Product Listed Successfully',
      message: 'Your Bell Peppers listing is now live on marketplace',
      time: '1 day ago',
      unread: false,
      icon: Package,
      color: '#7B1FA2',
    },
    {
      id: 6,
      type: 'trend',
      title: 'Price Trend Alert',
      message: 'Tomato prices increased by 15% in your region',
      time: '1 day ago',
      unread: false,
      icon: TrendingUp,
      color: '#2E7D32',
    },
    {
      id: 7,
      type: 'order',
      title: 'Order Delivered',
      message: 'Order #ORD-1001 has been successfully delivered',
      time: '2 days ago',
      unread: false,
      icon: Package,
      color: '#2E7D32',
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              notification.unread && styles.unreadCard,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${notification.color}15` },
              ]}
            >
              <notification.icon
                size={24}
                color={notification.color}
                strokeWidth={2}
              />
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {notification.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 4,
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.2,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 16,
  },
});

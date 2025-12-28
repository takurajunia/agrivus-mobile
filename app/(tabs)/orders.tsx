import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
} from 'lucide-react-native';

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('all');

  const orders = [
    {
      id: 'ORD-1001',
      customer: 'John Farms Co.',
      product: 'Organic Tomatoes',
      quantity: '500 kg',
      amount: '$1,250',
      status: 'delivered',
      date: '2 days ago',
    },
    {
      id: 'ORD-1002',
      customer: 'Green Valley Market',
      product: 'Fresh Carrots',
      quantity: '300 kg',
      amount: '$780',
      status: 'processing',
      date: '5 hours ago',
    },
    {
      id: 'ORD-1003',
      customer: 'Urban Grocery',
      product: 'Potatoes',
      quantity: '1000 kg',
      amount: '$2,100',
      status: 'pending',
      date: '1 day ago',
    },
    {
      id: 'ORD-1004',
      customer: 'Fresh Foods Inc.',
      product: 'Bell Peppers',
      quantity: '200 kg',
      amount: '$950',
      status: 'cancelled',
      date: '3 days ago',
    },
    {
      id: 'ORD-1005',
      customer: 'Local Market',
      product: 'Organic Lettuce',
      quantity: '150 kg',
      amount: '$420',
      status: 'delivered',
      date: '1 week ago',
    },
  ];

  const tabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Pending', count: 1 },
    { key: 'processing', label: 'Processing', count: 1 },
    { key: 'delivered', label: 'Delivered', count: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#2E7D32';
      case 'processing':
        return '#1976D2';
      case 'pending':
        return '#F57C00';
      case 'cancelled':
        return '#D32F2F';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle;
      case 'processing':
        return Clock;
      case 'pending':
        return Clock;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.badge,
                activeTab === tab.key && styles.activeBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === tab.key && styles.activeBadgeText,
                ]}
              >
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          const statusColor = getStatusColor(order.status);

          return (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                  <Package size={16} color="#666" />
                  <Text style={styles.orderId}>{order.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                  <StatusIcon size={14} color={statusColor} strokeWidth={2.5} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.customerName}>{order.customer}</Text>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Product:</Text>
                  <Text style={styles.detailValue}>{order.product}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{order.quantity}</Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amount}>{order.amount}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock size={14} color="#999" />
                  <Text style={styles.time}>{order.date}</Text>
                </View>
                <ChevronRight size={20} color="#999" />
              </View>
            </TouchableOpacity>
          );
        })}
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    maxHeight: 56,
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#1B5E20',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  activeBadgeText: {
    color: '#FFFFFF',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  orderDetails: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  amountLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: -0.3,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
  },
  bottomPadding: {
    height: 16,
  },
});

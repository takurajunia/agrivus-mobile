import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {
  Search,
  MessageCircle,
  MoreVertical,
  Circle,
} from 'lucide-react-native';

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'John Farms Co.',
      lastMessage: 'Great! When can you deliver?',
      time: '2m',
      unread: 2,
      online: true,
      avatar: '🌾',
    },
    {
      id: 2,
      name: 'Green Valley Market',
      lastMessage: 'Thanks for the quick response',
      time: '1h',
      unread: 0,
      online: true,
      avatar: '🏪',
    },
    {
      id: 3,
      name: 'Urban Grocery',
      lastMessage: 'Can you send me the catalog?',
      time: '3h',
      unread: 1,
      online: false,
      avatar: '🛒',
    },
    {
      id: 4,
      name: 'Fresh Foods Inc.',
      lastMessage: 'Payment has been processed',
      time: '1d',
      unread: 0,
      online: false,
      avatar: '🥬',
    },
    {
      id: 5,
      name: 'Local Market',
      lastMessage: 'Looking forward to our partnership',
      time: '2d',
      unread: 0,
      online: false,
      avatar: '🏬',
    },
    {
      id: 6,
      name: 'Organic Store',
      lastMessage: 'Do you have organic options?',
      time: '3d',
      unread: 0,
      online: true,
      avatar: '🌱',
    },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Search size={20} color="#999" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {filteredConversations.map((conversation) => (
          <TouchableOpacity key={conversation.id} style={styles.conversationCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{conversation.avatar}</Text>
              {conversation.online && (
                <View style={styles.onlineDot}>
                  <Circle size={10} color="#2E7D32" fill="#2E7D32" />
                </View>
              )}
            </View>

            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName}>{conversation.name}</Text>
                <Text style={styles.time}>{conversation.time}</Text>
              </View>
              <View style={styles.messageRow}>
                <Text
                  style={[
                    styles.lastMessage,
                    conversation.unread > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
                {conversation.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{conversation.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.emptyState}>
        {filteredConversations.length === 0 && (
          <View style={styles.emptyContent}>
            <MessageCircle size={64} color="#E0E0E0" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start a conversation to connect with buyers'}
            </Text>
          </View>
        )}
      </View>
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
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 56,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unreadBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 16,
  },
});

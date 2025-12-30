import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Circle,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import ModernInput from "../../src/components/ModernInput";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = [
    {
      id: 1,
      name: "John Farms Co.",
      lastMessage: "Great! When can you deliver?",
      time: "2m",
      unread: 2,
      online: true,
      avatar: "🌾",
    },
    {
      id: 2,
      name: "Green Valley Market",
      lastMessage: "Thanks for the quick response",
      time: "1h",
      unread: 0,
      online: true,
      avatar: "🏪",
    },
    {
      id: 3,
      name: "Urban Grocery",
      lastMessage: "Can you send me the catalog?",
      time: "3h",
      unread: 1,
      online: false,
      avatar: "🛒",
    },
    {
      id: 4,
      name: "Fresh Foods Inc.",
      lastMessage: "Payment has been processed",
      time: "1d",
      unread: 0,
      online: false,
      avatar: "🥬",
    },
    {
      id: 5,
      name: "Local Market",
      lastMessage: "Looking forward to our partnership",
      time: "2d",
      unread: 0,
      online: false,
      avatar: "🏬",
    },
    {
      id: 6,
      name: "Organic Store",
      lastMessage: "Do you have organic options?",
      time: "3d",
      unread: 0,
      online: true,
      avatar: "🌱",
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <AnimatedButton
          title="More"
          variant="ghost"
          size="sm"
          onPress={() => console.log("More pressed")}
        >
          <MoreVertical size={20} color={theme.colors.text.primary} />
        </AnimatedButton>
      </View>

      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
        />
      </View>

      <ScrollView
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredConversations.map((conversation, index) => (
          <AnimatedCard
            key={conversation.id}
            style={styles.conversationCard}
            delay={index * 50}
            onPress={() =>
              console.log(`Chat with ${conversation.name} pressed`)
            }
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{conversation.avatar}</Text>
              {conversation.online && (
                <View style={styles.onlineDot}>
                  <Circle
                    size={10}
                    color={theme.colors.success}
                    fill={theme.colors.success}
                  />
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
                    <Text style={styles.unreadCount}>
                      {conversation.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </AnimatedCard>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {filteredConversations.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyContent}>
            <MessageCircle
              size={64}
              color={theme.colors.text.tertiary}
              strokeWidth={1.5}
            />
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search"
                : "Start a conversation to connect with buyers"}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    position: "relative",
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    fontSize: 28,
    textAlign: "center",
    lineHeight: 56,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  conversationName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  unreadMessage: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCount: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  emptyState: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  emptyContent: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});

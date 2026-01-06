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
import { Search, MessageCircle, MoreVertical } from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicSearchBar,
  NeumorphicAvatar,
  NeumorphicIconButton,
  NeumorphicBadge,
} from "../../src/components/neumorphic";
import chatService, {
  ConversationWithUser,
} from "../../src/services/chatService";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Don't show alert on initial load failure, just show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConversationPress = (conversation: ConversationWithUser) => {
    router.push(`/chat/${conversation.conversation.id}`);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <NeumorphicScreen variant="list">
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={true}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <NeumorphicIconButton
          icon={
            <MoreVertical size={20} color={neumorphicColors.text.primary} />
          }
          onPress={() => console.log("More pressed")}
          size="medium"
        />
      </View>

      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv, index) => (
            <NeumorphicCard
              key={conv.conversation.id}
              style={styles.conversationCard}
              animationDelay={index * 50}
              onPress={() => handleConversationPress(conv)}
              variant="standard"
            >
              <View style={styles.cardContent}>
                <NeumorphicAvatar
                  name={conv.otherUser.fullName}
                  size="large"
                  status={conv.unreadCount > 0 ? "online" : undefined}
                  showStatus={conv.unreadCount > 0}
                />

                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>
                      {conv.otherUser.fullName}
                    </Text>
                    <Text style={styles.time}>
                      {formatTime(conv.conversation.lastMessageAt)}
                    </Text>
                  </View>
                  <View style={styles.messageRow}>
                    <Text
                      style={[
                        styles.lastMessage,
                        conv.unreadCount > 0 && styles.unreadMessage,
                      ]}
                      numberOfLines={1}
                    >
                      {conv.conversation.lastMessageText || "No messages yet"}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>
                          {conv.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </NeumorphicCard>
          ))
        ) : (
          <View style={styles.emptyContent}>
            <MessageCircle
              size={64}
              color={neumorphicColors.text.tertiary}
              strokeWidth={1.5}
            />
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search"
                : "Start a conversation from a listing or order"}
            </Text>
          </View>
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
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  conversationCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  conversationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  conversationName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.2,
  },
  time: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    fontWeight: "500",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadMessage: {
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  unreadBadge: {
    backgroundColor: neumorphicColors.primary[600],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCount: {
    color: neumorphicColors.text.inverse,
    ...typography.caption,
    fontWeight: "700",
  },
  emptyContent: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

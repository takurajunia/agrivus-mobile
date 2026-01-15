import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  Send,
  Phone,
  MoreVertical,
  Check,
  CheckCheck,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicIconButton,
  NeumorphicInput,
  NeumorphicAvatar,
} from "../../src/components/neumorphic";
import chatService, {
  MessageWithSender,
  ConversationWithUser,
} from "../../src/services/chatService";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [conversation, setConversation] = useState<ConversationWithUser | null>(
    null
  );
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUserData, setOtherUserData] = useState<{
    id: string;
    fullName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");

  // First, try to get or create conversation (in case id is a user ID)
  const initializeConversation = useCallback(async () => {
    if (!id) return;

    try {
      // Try to get or create conversation (id could be a user ID)
      const response = await chatService.getOrCreateConversation(id);
      if (response.success && response.data) {
        // response.data contains the conversation (or conversation property)
        const convData = response.data;
        const convId = convData.conversation?.id || (convData as any).id;

        if (convId) {
          setConversationId(convId);
          // Add unreadCount default since getOrCreateConversation doesn't return it
          setConversation({
            ...convData,
            unreadCount: 0,
          });
          // Store other user data from the response
          if (convData.otherUser) {
            setOtherUserData(convData.otherUser);
          }
          return convId;
        }
      }
    } catch (error: any) {
      // If getOrCreateConversation fails, the id might already be a conversation ID
      // Just use it directly
      console.log(
        "getOrCreateConversation failed, trying as conversation ID:",
        error?.message
      );
      setConversationId(id);
      return id;
    }

    // Fallback: assume id is already a conversation ID
    setConversationId(id);
    return id;
  }, [id]);

  const fetchMessages = useCallback(async (convId: string) => {
    if (!convId) return;
    try {
      const response = await chatService.getMessages(convId);
      if (response.success && response.data) {
        // Backend returns data as array directly, already reversed (oldest first)
        const messagesData = Array.isArray(response.data)
          ? response.data
          : response.data.messages || [];
        setMessages(messagesData);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const convId = await initializeConversation();
      if (convId) {
        await fetchMessages(convId);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [initializeConversation, fetchMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationId || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const response = await chatService.sendMessage(conversationId, {
        content: messageText,
      });
      if (response.success && response.data) {
        setMessages((prev) => [...prev, response.data]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setInputText(messageText); // Restore message if failed
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isMyMessage = (senderId: string) => {
    return senderId === user?.id;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, MessageWithSender[]>);

  if (loading) {
    return (
      <NeumorphicScreen variant="detail" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  // Find the other user's name (not the current user)
  // Priority: otherUserData (from getOrCreateConversation) > messages > fallback
  const otherUserName =
    otherUserData?.fullName ||
    conversation?.otherUser?.fullName ||
    messages.find((msg) => msg.sender?.id !== user?.id)?.sender?.fullName ||
    messages[0]?.sender?.fullName ||
    "Chat";

  return (
    <NeumorphicScreen variant="detail" showLeaves={false}>
      {/* Header */}
      <NeumorphicCard style={styles.header} variant="standard" animated={false}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />

        <View style={styles.headerInfo}>
          <NeumorphicAvatar
            name={otherUserName}
            size="small"
            status="online"
            showStatus
          />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{otherUserName}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <NeumorphicIconButton
            icon={<Phone size={20} color={neumorphicColors.text.primary} />}
            onPress={() => {}}
            variant="ghost"
            size="small"
          />
          <NeumorphicIconButton
            icon={
              <MoreVertical size={20} color={neumorphicColors.text.primary} />
            }
            onPress={() => {}}
            variant="ghost"
            size="small"
          />
        </View>
      </NeumorphicCard>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <View key={date}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>
                  {formatDateHeader(date)}
                </Text>
              </View>

              {/* Messages */}
              {msgs.map((msg, index) => {
                const isMine = isMyMessage(msg.message.senderId);
                const showAvatar =
                  !isMine &&
                  (index === 0 ||
                    msgs[index - 1]?.message.senderId !== msg.message.senderId);

                return (
                  <View
                    key={msg.message.id}
                    style={[
                      styles.messageRow,
                      isMine ? styles.myMessageRow : styles.theirMessageRow,
                    ]}
                  >
                    {!isMine && showAvatar && (
                      <NeumorphicAvatar
                        name={msg.sender.fullName}
                        size="small"
                        style={styles.messageAvatar}
                      />
                    )}
                    {!isMine && !showAvatar && (
                      <View style={styles.avatarPlaceholder} />
                    )}

                    <View
                      style={[
                        styles.messageBubble,
                        isMine
                          ? styles.myMessageBubble
                          : styles.theirMessageBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMine
                            ? styles.myMessageText
                            : styles.theirMessageText,
                        ]}
                      >
                        {msg.message.content}
                      </Text>
                      <View style={styles.messageFooter}>
                        <Text
                          style={[
                            styles.messageTime,
                            isMine
                              ? styles.myMessageTime
                              : styles.theirMessageTime,
                          ]}
                        >
                          {formatTime(msg.message.createdAt)}
                        </Text>
                        {isMine &&
                          (msg.message.isRead ? (
                            <CheckCheck
                              size={14}
                              color={neumorphicColors.primary[300]}
                            />
                          ) : (
                            <Check
                              size={14}
                              color={neumorphicColors.text.inverse}
                            />
                          ))}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Start the conversation!</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <NeumorphicCard
          style={styles.inputContainer}
          variant="standard"
          animated={false}
        >
          <NeumorphicInput
            containerStyle={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            variant="textarea"
          />
          <NeumorphicIconButton
            icon={
              sending ? (
                <ActivityIndicator
                  size="small"
                  color={neumorphicColors.text.inverse}
                />
              ) : (
                <Send size={20} color={neumorphicColors.text.inverse} />
              )
            }
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
            variant="primary"
            size="medium"
          />
        </NeumorphicCard>
      </KeyboardAvoidingView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
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
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerName: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  headerStatus: {
    ...typography.caption,
    color: neumorphicColors.semantic.success,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dateHeader: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  dateHeaderText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    backgroundColor: neumorphicColors.base.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    alignItems: "flex-end",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  myMessageBubble: {
    backgroundColor: neumorphicColors.primary[600],
    borderBottomRightRadius: borderRadius.sm,
  },
  theirMessageBubble: {
    backgroundColor: neumorphicColors.base.card,
    borderBottomLeftRadius: borderRadius.sm,
    ...getNeumorphicShadow(2),
  },
  messageText: {
    ...typography.body,
  },
  myMessageText: {
    color: neumorphicColors.text.inverse,
  },
  theirMessageText: {
    color: neumorphicColors.text.primary,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  messageTime: {
    ...typography.caption,
  },
  myMessageTime: {
    color: neumorphicColors.primary[200],
  },
  theirMessageTime: {
    color: neumorphicColors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h5,
    color: neumorphicColors.text.secondary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
  },
});

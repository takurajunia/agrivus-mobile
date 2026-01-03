import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
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
import { theme } from "../../src/theme/tokens";
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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    try {
      const response = await chatService.getMessages(id);
      if (response.success && response.data) {
        setMessages(response.data.messages.reverse()); // Oldest first
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages();
    // Mark conversation as read
    if (id) {
      chatService.markAsRead(id).catch(console.error);
    }
  }, [fetchMessages, id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !id || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const response = await chatService.sendMessage(id, {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherUserName = messages[0]?.sender?.fullName || "Chat";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarTextSmall}>
              {getInitials(otherUserName)}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{otherUserName}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Phone size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

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
                      <View style={styles.messageAvatar}>
                        <Text style={styles.messageAvatarText}>
                          {getInitials(msg.sender.fullName)}
                        </Text>
                      </View>
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
                              color={theme.colors.primary[300]}
                            />
                          ) : (
                            <Check
                              size={14}
                              color={theme.colors.text.inverse}
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.text.inverse}
              />
            ) : (
              <Send size={20} color={theme.colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  avatarTextSmall: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  headerStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  dateHeader: {
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  dateHeaderText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
    alignItems: "flex-end",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  messageAvatarText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  avatarPlaceholder: {
    width: 32,
    marginRight: theme.spacing.sm,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
  },
  myMessageBubble: {
    backgroundColor: theme.colors.primary[600],
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  theirMessageBubble: {
    backgroundColor: theme.colors.background.primary,
    borderBottomLeftRadius: theme.borderRadius.sm,
    ...theme.shadows.sm,
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  myMessageText: {
    color: theme.colors.text.inverse,
  },
  theirMessageText: {
    color: theme.colors.text.primary,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  messageTime: {
    fontSize: theme.typography.fontSize.xs,
  },
  myMessageTime: {
    color: theme.colors.primary[200],
  },
  theirMessageTime: {
    color: theme.colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.primary[300],
  },
});

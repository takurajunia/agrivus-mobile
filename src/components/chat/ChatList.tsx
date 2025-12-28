import React, { useState, useEffect, useCallback } from "react";
import { ConversationItem } from "./ConversationItem";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import chatService from "../../services/chatService";
import LoadingSpinner from "../common/LoadingSpinner";

interface ConversationWithDetails {
  id: string;
  type: string;
  participant1Id: string;
  participant2Id: string | null;
  name: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: string;
    fullName: string;
    email: string;
  };
  unreadCount: number;
}

interface ChatListProps {
  onSelectConversation: (conversation: ConversationWithDetails) => void;
  activeConversationId: string | null;
  autoSelectConversationId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  onSelectConversation,
  activeConversationId,
  autoSelectConversationId,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { onlineUsers, checkOnlineStatus } = useChat();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load conversations with retry logic
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("Please log in to view your conversations");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getConversations();

      if (response.success) {
        const conversationsData = response.data.map((conv: any) => ({
          ...conv.conversation,
          otherUser: conv.otherUser,
          unreadCount: conv.unreadCount || 0,
        }));
        setConversations(conversationsData);
        setRetryCount(0);
      } else {
        throw new Error(response.message || "Failed to load conversations");
      }
    } catch (err: any) {
      console.error("Failed to load conversations:", err);

      // Provide user-friendly error messages
      let errorMessage = "Failed to load conversations";

      if (
        err.message?.includes("network") ||
        err.message?.includes("Network")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (
        err.message?.includes("401") ||
        err.message?.includes("unauthorized")
      ) {
        errorMessage = "Session expired. Please log in again.";
      } else if (err.message?.includes("500")) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Check online status when conversations load
  useEffect(() => {
    if (conversations.length > 0 && checkOnlineStatus) {
      const userIds = conversations.map((conv) => conv.otherUser.id);
      checkOnlineStatus(userIds);

      // Also set up periodic checks every 30 seconds
      const interval = setInterval(() => {
        checkOnlineStatus(userIds);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [conversations.length, checkOnlineStatus]);

  // Auto-select conversation if specified
  useEffect(() => {
    if (
      autoSelectConversationId &&
      conversations.length > 0 &&
      !activeConversationId
    ) {
      const conversation = conversations.find(
        (conv) => conv.id === autoSelectConversationId
      );
      if (conversation) {
        onSelectConversation(conversation);
      }
    }
  }, [
    autoSelectConversationId,
    conversations,
    activeConversationId,
    onSelectConversation,
  ]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    loadConversations();
  }, [loadConversations]);

  // Listen for new messages to update unread counts
  useEffect(() => {
    const handleNewMessage = (event: any) => {
      const { conversationId, message } = event.detail;

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            // Only increment unread if not currently viewing this conversation
            const shouldIncrementUnread =
              activeConversationId !== conversationId &&
              message.senderId !== user?.id;

            return {
              ...conv,
              lastMessageText: message.content,
              lastMessageAt: message.createdAt,
              lastMessageSenderId: message.senderId,
              unreadCount: shouldIncrementUnread
                ? conv.unreadCount + 1
                : conv.unreadCount,
            };
          }
          return conv;
        })
      );
    };

    // Listen for conversation updates (new conversations created)
    const handleConversationUpdate = () => {
      loadConversations();
    };

    window.addEventListener("chat:new-message", handleNewMessage);
    window.addEventListener(
      "chat:conversation-updated",
      handleConversationUpdate
    );

    return () => {
      window.removeEventListener("chat:new-message", handleNewMessage);
      window.removeEventListener(
        "chat:conversation-updated",
        handleConversationUpdate
      );
    };
  }, [activeConversationId, user?.id, loadConversations]);

  // Reset unread count when conversation is selected
  useEffect(() => {
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    }
  }, [activeConversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-600 mb-2 font-medium">Something went wrong</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {retryCount > 0 ? `Retry (${retryCount})` : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="font-medium mb-1">No conversations yet</p>
          <p className="text-sm">
            Start chatting by messaging a farmer, buyer, or transporter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={{
            ...conversation,
            isOnline: onlineUsers[conversation.otherUser.id],
          }}
          isActive={conversation.id === activeConversationId}
          onClick={() => onSelectConversation(conversation)}
        />
      ))}
    </div>
  );
};

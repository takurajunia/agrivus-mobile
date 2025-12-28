import React, { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import chatService, {
  type MessageWithSender,
} from "../../services/chatService";
import LoadingSpinner from "../common/LoadingSpinner";

interface ChatWindowProps {
  conversationId: string;
  otherUser: {
    id: string;
    fullName: string;
    email: string;
  };
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  otherUser,
  onClose,
}) => {
  const { user } = useAuth();
  const { setActiveConversationId, markAsRead, typingUsers, onlineUsers } =
    useChat();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Set active conversation
  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await chatService.getMessages(conversationId);
        if (response.success) {
          setMessages(response.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (!user) return;

    const unreadMessages = messages
      .filter((msg) => !msg.message.isRead && msg.message.senderId !== user.id)
      .map((msg) => msg.message.id);

    if (unreadMessages.length > 0) {
      markAsRead(conversationId, unreadMessages);
    }
  }, [messages, conversationId, markAsRead, user]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (event: any) => {
      const newMessage = event.detail;
      if (newMessage.conversationId === conversationId) {
        // Check if message already exists
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.message.id === newMessage.id);
          if (exists) return prev;

          // Add message with sender info
          return [
            ...prev,
            {
              message: newMessage,
              sender: {
                id: newMessage.senderId,
                fullName:
                  newMessage.senderId === user.id
                    ? user.fullName
                    : otherUser.fullName,
                email:
                  newMessage.senderId === user.id
                    ? user.email
                    : otherUser.email,
              },
            },
          ];
        });
      }
    };

    const handleMessagesRead = (event: any) => {
      const { conversationId: convId, messageIds } = event.detail;
      if (convId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (messageIds.includes(msg.message.id)) {
              return {
                ...msg,
                message: {
                  ...msg.message,
                  isRead: true,
                  readAt: new Date().toISOString(),
                },
              };
            }
            return msg;
          })
        );
      }
    };

    window.addEventListener("chat:message", handleNewMessage);
    window.addEventListener("chat:messages-read", handleMessagesRead);

    return () => {
      window.removeEventListener("chat:message", handleNewMessage);
      window.removeEventListener("chat:messages-read", handleMessagesRead);
    };
  }, [conversationId, user, otherUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isTyping = typingUsers[conversationId]?.includes(otherUser.id);
  const isOnline = onlineUsers[otherUser.id];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-green-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
              {otherUser.fullName.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser.fullName}
            </h3>
            <p className="text-xs text-gray-500">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50"
        style={{ maxHeight: "calc(100vh - 240px)" }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
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
              <p>No messages yet</p>
              <p className="text-sm mt-1">
                Start a conversation with {otherUser.fullName}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.message.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator userName={otherUser.fullName} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
};

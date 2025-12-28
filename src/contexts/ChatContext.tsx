import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import type { Message } from "../services/chatService";

interface ChatContextType {
  socket: Socket | null;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  sendTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onlineUsers: Record<string, boolean>;
  checkOnlineStatus: (userIds: string[]) => void;
  typingUsers: Record<string, string[]>; // conversationId -> array of typing userIds
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("💬 Chat connected");
    });

    newSocket.on("disconnect", () => {
      console.log("💬 Chat disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Chat connection error:", error);
    });

    // Handle incoming messages
    newSocket.on("chat:message", (message: Message) => {
      // This will be handled by individual components
      window.dispatchEvent(
        new CustomEvent("chat:message", { detail: message })
      );
    });

    // Handle new message notifications (when not in conversation)
    newSocket.on(
      "chat:new-message",
      (data: { conversationId: string; message: Message }) => {
        window.dispatchEvent(
          new CustomEvent("chat:new-message", { detail: data })
        );
      }
    );

    // Handle read receipts
    newSocket.on("chat:messages-read", (data: any) => {
      window.dispatchEvent(
        new CustomEvent("chat:messages-read", { detail: data })
      );
    });

    // Handle typing indicators
    newSocket.on(
      "chat:user-typing",
      (data: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const existing = prev[data.conversationId] || [];
          if (!existing.includes(data.userId)) {
            return {
              ...prev,
              [data.conversationId]: [...existing, data.userId],
            };
          }
          return prev;
        });
      }
    );

    newSocket.on(
      "chat:user-stopped-typing",
      (data: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const existing = prev[data.conversationId] || [];
          return {
            ...prev,
            [data.conversationId]: existing.filter((id) => id !== data.userId),
          };
        });
      }
    );

    // Handle online status responses
    newSocket.on("chat:online-status", (statuses: Record<string, boolean>) => {
      setOnlineUsers((prev) => ({ ...prev, ...statuses }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  // Join/leave conversation rooms when active conversation changes
  useEffect(() => {
    if (!socket || !activeConversationId) return;

    socket.emit("chat:join", activeConversationId);

    return () => {
      socket.emit("chat:leave", activeConversationId);
    };
  }, [socket, activeConversationId]);

  const sendMessage = (conversationId: string, content: string) => {
    if (!socket) return;

    socket.emit("chat:send", {
      conversationId,
      content,
      messageType: "text",
    });
  };

  const markAsRead = (conversationId: string, messageIds: string[]) => {
    if (!socket || messageIds.length === 0) return;

    socket.emit("chat:mark-read", {
      conversationId,
      messageIds,
    });
  };

  const sendTyping = (conversationId: string) => {
    if (!socket) return;
    socket.emit("chat:typing", conversationId);
  };

  const stopTyping = (conversationId: string) => {
    if (!socket) return;
    socket.emit("chat:stop-typing", conversationId);
  };

  const checkOnlineStatus = useCallback(
    (userIds: string[]) => {
      if (!socket) return;
      socket.emit("chat:check-online", userIds);
    },
    [socket]
  );

  return (
    <ChatContext.Provider
      value={{
        socket,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        markAsRead,
        sendTyping,
        stopTyping,
        onlineUsers,
        checkOnlineStatus,
        typingUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    // Return a default/empty implementation instead of throwing
    console.warn("useChat called outside of ChatProvider - returning defaults");
    return {
      socket: null,
      activeConversationId: null,
      setActiveConversationId: () => {},
      sendMessage: () => {},
      markAsRead: () => {},
      sendTyping: () => {},
      stopTyping: () => {},
      onlineUsers: {},
      checkOnlineStatus: () => {},
      typingUsers: {},
    };
  }
  return context;
}

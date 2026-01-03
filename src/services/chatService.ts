import api from "./api";

// Types
export interface Conversation {
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
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: string;
  content: string;
  attachments: any[];
  isRead: boolean;
  readAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithUser {
  conversation: Conversation;
  otherUser: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  unreadCount: number;
}

export interface MessageWithSender {
  message: Message;
  sender: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface SendMessageData {
  content: string;
  messageType?: "text" | "image" | "file";
  attachments?: string[];
}

const chatService = {
  // Get or create conversation with another user
  async getOrCreateConversation(
    otherUserId: string
  ): Promise<{ success: boolean; data: ConversationWithUser }> {
    const response = await api.post("/chat/conversations", { otherUserId });
    return response.data;
  },

  // Get all conversations for current user
  async getConversations(): Promise<{
    success: boolean;
    data: { conversations: ConversationWithUser[] };
  }> {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  // Get messages for a conversation with pagination
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    success: boolean;
    data: {
      messages: MessageWithSender[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Send a message to a conversation
  async sendMessage(
    conversationId: string,
    data: SendMessageData
  ): Promise<{ success: boolean; data: MessageWithSender }> {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  // Get unread message count
  async getUnreadCount(): Promise<{
    success: boolean;
    data: { unreadCount: number };
  }> {
    const response = await api.get("/chat/unread-count");
    return response.data;
  },

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    const response = await api.patch(
      `/chat/conversations/${conversationId}/read`
    );
    return response.data;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
};

export default chatService;

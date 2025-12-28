import api from "./api";

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
  };
}

export interface MessageWithSender {
  message: Message;
  sender: {
    id: string;
    fullName: string;
    email: string;
  };
}

const chatService = {
  // Get or create conversation with another user
  async getOrCreateConversation(otherUserId: string) {
    const response = await api.post("/chat/conversations", { otherUserId });
    return response.data;
  },

  // Get all conversations
  async getConversations() {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  // Get messages for a conversation
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Get unread message count
  async getUnreadCount() {
    const response = await api.get("/chat/unread-count");
    return response.data;
  },

  // Delete a message
  async deleteMessage(messageId: string) {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
};

export default chatService;

import React from "react";
import { useAuth } from "../../contexts/AuthContext";

interface MessageBubbleProps {
  message: {
    message: {
      id: string;
      conversationId: string;
      senderId: string;
      content: string;
      isRead: boolean;
      createdAt: string;
    };
    sender: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = message.message.senderId === user?.id;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
        {/* Sender name (only for received messages) */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1 px-2">
            {message.sender.fullName}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? "bg-green-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          <p className="text-sm break-words">{message.message.content}</p>
        </div>

        {/* Timestamp and status */}
        <div
          className={`text-xs text-gray-500 mt-1 px-2 flex items-center gap-1 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatTime(message.message.createdAt)}</span>
          {isOwnMessage && (
            <span>
              {message.message.isRead ? (
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  <path d="M12.707 5.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L8 8.586l3.293-3.293a1 1 0 011.414 0z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

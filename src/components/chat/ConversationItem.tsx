import React from "react";

interface ConversationItemProps {
  conversation: {
    id: string;
    lastMessageText: string | null;
    lastMessageAt: string | null;
    otherUser: {
      id: string;
      fullName: string;
      email: string;
    };
    unreadCount: number;
    isOnline?: boolean;
  };
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? "bg-green-50 border-l-4 border-l-green-600" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
            {conversation.otherUser.fullName.charAt(0).toUpperCase()}
          </div>
          {conversation.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.otherUser.fullName}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessageText || "No messages yet"}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="flex-shrink-0 ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

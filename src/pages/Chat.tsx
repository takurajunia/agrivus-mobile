import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChatList } from "../components/chat/ChatList";
import { ChatWindow } from "../components/chat/ChatWindow";

interface SelectedConversation {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function Chat() {
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] =
    useState<SelectedConversation | null>(null);

  // Clear location state after using it to prevent re-selection on refresh
  useEffect(() => {
    if (location.state?.conversationId) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="h-[calc(100vh-180px)] flex">
      {/* Conversations List */}
      <div
        className={`w-full md:w-96 border-r border-gray-200 bg-white ${
          selectedConversation ? "hidden md:block" : ""
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        <ChatList
          onSelectConversation={(conv) =>
            setSelectedConversation({
              id: conv.id,
              otherUser: conv.otherUser,
            })
          }
          activeConversationId={selectedConversation?.id || null}
          autoSelectConversationId={location.state?.conversationId}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 ${
          !selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUser={selectedConversation.otherUser}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-300"
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
              <p className="text-lg font-medium mb-1">Select a conversation</p>
              <p className="text-sm">
                Choose a conversation from the left to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const QuickChatButton: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) return null;

  const handleStartChat = async (_userRole: string) => {
    setLoading(true);
    try {
      // In a real scenario, you'd have a way to select a specific user
      // For now, we'll just navigate to the chat page
      navigate("/chat");
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showOptions && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 mb-2">
            <h3 className="font-semibold text-gray-900 mb-3">Start a chat</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleStartChat("farmer")}
                disabled={loading}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Farmer</p>
                  <p className="text-xs text-gray-500">Chat with farmers</p>
                </div>
              </button>

              <button
                onClick={() => handleStartChat("buyer")}
                disabled={loading}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Buyer</p>
                  <p className="text-xs text-gray-500">Chat with buyers</p>
                </div>
              </button>

              <button
                onClick={() => handleStartChat("transporter")}
                disabled={loading}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Transporter</p>
                  <p className="text-xs text-gray-500">
                    Chat with transporters
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => navigate("/chat")}
                className="w-full text-center text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View all messages
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          {showOptions ? (
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
          ) : (
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </>
  );
};

import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  return (
    <ChatContext.Provider value={{ conversations, setConversations }}>
      {children}
    </ChatContext.Provider>
  );
};

import React, { createContext, useState, useContext, ReactNode } from "react";

type ChatContextType = {
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatProviderProps = {
  children: ReactNode;
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  return (
    <ChatContext.Provider value={{ conversations, setConversations }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};

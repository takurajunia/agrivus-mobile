import React, { createContext, useState, useContext } from "react";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

import React, { createContext, useState, useContext, ReactNode } from "react";

type NotificationsContextType = {
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
};

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

type NotificationsProviderProps = {
  children: ReactNode;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  return context;
};

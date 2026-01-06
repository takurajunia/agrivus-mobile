import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
};

type NotificationsContextType = {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
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

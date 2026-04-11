import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
};

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = (title: string, message: string) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    const newNotification: NotificationItem = {
      id,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    }; 
    setNotifications((current) => [newNotification, ...current]);

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new window.Notification(title, {
        body: message,
      });
    }
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

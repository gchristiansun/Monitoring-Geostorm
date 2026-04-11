import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../contexts/NotificationContext";

export default function NotificationDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  if (!open) {
    return null;
  }

  return (
    <div className="absolute right-4 top-16 z-50 w-[320px] max-w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p>
          <p className="text-xs text-[var(--muted-foreground)]">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs text-[var(--foreground)] hover:text-white"
            onClick={markAllRead}
          >
            Mark read
          </button>
          <button
            type="button"
            className="rounded-full p-1 text-[var(--foreground)] hover:bg-[var(--input)]"
            onClick={onClose}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-[var(--muted-foreground)]">No notifications yet.</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-b border-[var(--border)] px-4 py-3 ${notification.read ? "bg-[var(--card)]" : "bg-[var(--input)]"}`}
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{notification.title}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{notification.message}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Bell } from "lucide-react";
import { useSocket } from "../context/SocketContext";

export default function NotificationBell() {
  const { notifications } = useSocket();
  const unreadCount = notifications.length;

  return (
    <div className="relative inline-flex items-center">
      <Bell className="w-6 h-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {unreadCount}
        </span>
      )}
    </div>
  );
}

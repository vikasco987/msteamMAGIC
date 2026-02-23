"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, MessageSquare, CreditCard, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface Notification {
    id: string;
    type: string;
    content: string;
    taskId: string | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell({ isCollapsed }: { isCollapsed: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify(id ? { id } : { all: true }),
            });
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "MENTION": return <MessageSquare size={16} className="text-blue-400" />;
            case "TASK_COMPLETED": return <CheckSquare size={16} className="text-green-400" />;
            case "PAYMENT_ADDED": return <CreditCard size={16} className="text-yellow-400" />;
            case "COLLECTION_FOLLOWUP": return <Bell size={16} className="text-red-400 animate-pulse" />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium text-gray-300 hover:text-purple-300 hover:bg-white/5 w-full text-left outline-none"
                    aria-label="View notifications"
                >
                    <div className="relative">
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1e1b4b]">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && <span>Notifications</span>}
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    side="right"
                    align="start"
                    sideOffset={12}
                    className="z-[9999] w-80 bg-[#1e1b4b] border border-violet-800 rounded-xl shadow-2xl overflow-hidden text-white"
                >
                    <div className="p-3 border-b border-violet-800 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-sm">Team Alerts</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    markAsRead();
                                }}
                                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                                <CheckCircle2 size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto focus:outline-none">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No new alerts
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <DropdownMenu.Item
                                    key={n.id}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        markAsRead(n.id);
                                    }}
                                    className={`p-3 border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer outline-none ${!n.isRead ? 'bg-purple-500/10' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getIcon(n.type)}</div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-200 leading-relaxed">
                                                {n.content}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {new Date(n.createdAt).toLocaleString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenu.Item>
                            ))
                        )}
                    </div>
                    <DropdownMenu.Arrow className="fill-violet-800" />
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

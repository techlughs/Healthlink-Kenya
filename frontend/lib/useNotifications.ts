"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "@/lib/api";

export interface AppNotification {
    id: string;
    recipientUserId: string;
    type: string;
    message: string;
    relatedAppointmentId?: string;
    read: boolean;
    createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const WS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadInitial() {
            try {
                const [listRes, countRes] = await Promise.all([
                    api.get<AppNotification[]>("/notifications"),
                    api.get<{ count: number }>("/notifications/unread-count"),
                ]);
                if (!cancelled) {
                    setNotifications(listRes.data);
                    setUnreadCount(countRes.data.count);
                }
            } catch {
                // Silent fail: bell just stays empty. Real auth problems will already
                // surface elsewhere via the api.ts interceptor / logout flow.
            }
        }

        loadInitial();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        function connect() {
            const client = new Client({
                webSocketFactory: () => {
                    const token = localStorage.getItem("token") || "";
                    return new SockJS(`${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`);
                },
                reconnectDelay: 4000,
                onConnect: () => {
                    client.subscribe("/user/queue/notifications", (message) => {
                        const notif: AppNotification = JSON.parse(message.body);
                        setNotifications((prev) => [notif, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                    });
                },
            });

            client.activate();
            clientRef.current = client;
            return client;
        }

        let client = connect();

        function handleTokenRefreshed() {
            client.deactivate();
            client = connect();
        }

        window.addEventListener("token-refreshed", handleTokenRefreshed);

        return () => {
            window.removeEventListener("token-refreshed", handleTokenRefreshed);
            client.deactivate();
        };
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await api.post(`/notifications/${id}/read`);
        } catch {
            // Best-effort — if this fails, the item just shows unread again next load.
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await api.post("/notifications/read-all");
        } catch {
            // Best-effort — a failed bulk mark-read just means items show unread again next load.
        }
    }, []);

    return { notifications, unreadCount, markAsRead, markAllAsRead };
}

export function formatNotificationTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
"use client";

// ============================================================
// PARK CENTRAL — In-App Push Notifications
// ============================================================

import { useState, useCallback } from "react";
import { getUniqueId, getSystemTime } from "../utils";

export type NotifLevel = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id:        string;
  title:     string;
  body:      string;
  level:     NotifLevel;
  time:      string;
  read:      boolean;
  actionLabel?: string;
  actionTab?:   string;   // tab to navigate to on click
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif_demo_1",
      title: "Zaxira ogohlantirish",
      body: "Muzqaymoq Gilosli: 3 dona qoldi (min: 5)",
      level: "warning",
      time: "10:11",
      read: false,
      actionLabel: "Boshqaruvga o'tish",
      actionTab: "management",
    },
    {
      id: "notif_demo_2",
      title: "Yangi buyurtma",
      body: "Stol #3 — Bog' Choyxonasi (5 mehmon)",
      level: "info",
      time: "10:30",
      read: false,
      actionLabel: "Buyurtmani ko'rish",
      actionTab: "orders",
    },
    {
      id: "notif_demo_3",
      title: "Sotuv muvaffaqiyatli",
      body: "Shahzod Alimov — 142 000 so'm (Fast-Food)",
      level: "success",
      time: "10:14",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const push = useCallback((
    title: string,
    body: string,
    level: NotifLevel = "info",
    opts?: { actionLabel?: string; actionTab?: string }
  ) => {
    const notif: AppNotification = {
      id:          getUniqueId("notif"),
      title,
      body,
      level,
      time:        getSystemTime().slice(0, 5),
      read:        false,
      actionLabel: opts?.actionLabel,
      actionTab:   opts?.actionTab,
    };
    setNotifications((prev) => [notif, ...prev].slice(0, 50)); // max 50

    // Browser Notification API (if permitted)
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(`🌿 Park Central — ${title}`, { body, icon: "/favicon.ico" });
    }
  }, []);

  const markRead    = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    push,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    requestPermission,
  };
}

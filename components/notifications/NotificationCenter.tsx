"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, X, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import type { AppNotification, NotifLevel } from "./useNotifications";

interface NotificationCenterProps {
  notifications: AppNotification[];
  unreadCount:   number;
  onMarkRead:    (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss:     (id: string) => void;
  onClearAll:    () => void;
  onNavigate:    (tab: string) => void;
}

const LEVEL_STYLE: Record<NotifLevel, { icon: React.ReactNode; row: string; dot: string }> = {
  info:    { icon: <Info          className="w-4 h-4" />, row: "border-blue-100   bg-blue-50",    dot: "bg-blue-500"    },
  success: { icon: <CheckCircle2  className="w-4 h-4" />, row: "border-emerald-100 bg-emerald-50", dot: "bg-emerald-500" },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, row: "border-amber-100  bg-amber-50",   dot: "bg-amber-500"   },
  error:   { icon: <XCircle       className="w-4 h-4" />, row: "border-red-100    bg-red-50",     dot: "bg-red-500"     },
};

const ICON_COLOR: Record<NotifLevel, string> = {
  info:    "text-blue-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error:   "text-red-500",
};

export default function NotificationCenter({
  notifications, unreadCount,
  onMarkRead, onMarkAllRead, onDismiss, onClearAll, onNavigate,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all
          ${open
            ? "bg-[#1e3d1f] border-[#1e3d1f] text-white"
            : "bg-white border-[#dedad3] text-[#637063] hover:border-[#4d8751] hover:text-[#1e3d1f]"
          }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white
                           text-[9px] font-[800] flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: .96 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{    opacity: 0, y: -8, scale: .96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl border border-[#dedad3]
                       shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede8] bg-[#f7f5f2]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#4d8751]" />
                <span className="text-sm font-[800] text-[#1e3d1f]">Bildirishnomalar</span>
                {unreadCount > 0 && (
                  <span className="badge bg-red-100 text-red-700 border-red-200 text-[10px]">
                    {unreadCount} yangi
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button onClick={onMarkAllRead} title="Barchasini o'qildi belgilash"
                    className="btn-icon btn-icon-sm" >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={onClearAll} title="Barchasini o'chirish"
                    className="btn-icon btn-icon-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-[#9daa9e]">
                  <Bell className="w-10 h-10 stroke-[1.2]" />
                  <p className="text-sm font-[600]">Bildirishnomalar yo'q</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f7f5f2]">
                  <AnimatePresence initial={false}>
                    {notifications.map((n) => {
                      const style = LEVEL_STYLE[n.level];
                      const iconColor = ICON_COLOR[n.level];
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{    opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          onClick={() => onMarkRead(n.id)}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                            hover:bg-[#f7f5f2] transition-colors
                            ${!n.read ? "bg-[#fafcf9]" : ""}`}
                        >
                          {/* Unread dot */}
                          <div className="shrink-0 pt-1">
                            {!n.read
                              ? <span className={`w-2 h-2 rounded-full block ${style.dot}`} />
                              : <span className="w-2 h-2 rounded-full block bg-transparent" />
                            }
                          </div>

                          {/* Icon */}
                          <div className={`shrink-0 pt-0.5 ${iconColor}`}>
                            {style.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className={`text-xs font-[700] ${n.read ? "text-[#637063]" : "text-[#1e3d1f]"}`}>
                              {n.title}
                            </p>
                            <p className="text-[11px] text-[#637063] font-[500] leading-relaxed">
                              {n.body}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-[#9daa9e]">{n.time}</span>
                              {n.actionLabel && n.actionTab && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onNavigate(n.actionTab!); setOpen(false); onMarkRead(n.id); }}
                                  className="text-[10px] font-[700] text-[#4d8751] hover:underline"
                                >
                                  {n.actionLabel} →
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Dismiss */}
                          <button
                            onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                            className="shrink-0 text-[#c4ccc4] hover:text-[#637063] transition-colors mt-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[#f0ede8] bg-[#f7f5f2] text-center">
                <p className="text-[10px] text-[#9daa9e] font-[600]">
                  Jami {notifications.length} ta bildirishnoma
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

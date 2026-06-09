"use client";

import { Wifi, WifiOff, Leaf, Sun, Moon } from "lucide-react";
import NotificationCenter from "./notifications/NotificationCenter";
import type { AppNotification } from "./notifications/useNotifications";

interface HeaderProps {
  isOnline:      boolean;
  setIsOnline:   (v: boolean) => void;
  isDark:        boolean;
  onToggleDark:  () => void;
  notifications: AppNotification[];
  unreadCount:   number;
  onMarkRead:    (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss:     (id: string) => void;
  onClearAll:    () => void;
  onNavigate:    (tab: string) => void;
}

export default function Header({
  isOnline, setIsOnline,
  isDark, onToggleDark,
  notifications, unreadCount,
  onMarkRead, onMarkAllRead, onDismiss, onClearAll, onNavigate,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-[#dedad3] bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* ── Brand ── */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-[#1e3d1f] flex items-center justify-center shadow-sm">
            <Leaf className="w-4.5 h-4.5 text-[#91c494]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-[800] tracking-tight text-[#1e3d1f] leading-none">
                Park Central
              </span>
              <span className="badge badge-green hidden sm:inline-flex">V3.0</span>
            </div>
            <p className="text-[11px] text-[#637063] font-medium hidden sm:block leading-none mt-0.5">
              Yagona boshqaruv raqamli ekotizimi
            </p>
          </div>
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Network toggle */}
          <div className="flex items-center gap-1 bg-[#f7f5f2] p-1 rounded-xl border border-[#dedad3]">
            <button
              onClick={() => setIsOnline(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${isOnline ? "bg-[#1e3d1f] text-white shadow-sm" : "text-[#637063] hover:text-[#1e3d1f] hover:bg-[#eef7ef]"}`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Online</span>
            </button>
            <button
              onClick={() => setIsOnline(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${!isOnline ? "bg-amber-500 text-white shadow-sm" : "text-[#637063] hover:text-amber-700 hover:bg-amber-50"}`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </button>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all
              ${isDark
                ? "bg-[#1e3d1f] border-[#1e3d1f] text-[#91c494]"
                : "bg-white border-[#dedad3] text-[#637063] hover:border-[#4d8751] hover:text-[#1e3d1f]"
              }`}
            title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification center */}
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onDismiss={onDismiss}
            onClearAll={onClearAll}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* Offline warning strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center py-1 text-[11px] font-[700] tracking-wide">
          ⚠ &nbsp;Offline rejim — tranzaksiyalar IndexedDB'ga saqlanmoqda
        </div>
      )}
    </header>
  );
}

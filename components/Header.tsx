"use client";

import { Wifi, WifiOff, Leaf, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import NotificationCenter from "./notifications/NotificationCenter";
import type { AppNotification } from "./notifications/useNotifications";
import type { AuthUser, EmployeeRole } from "./types";
import { STALL_TYPE_META } from "./constants";

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
  // Auth
  user:          AuthUser | null;
  onLogout:      () => void;
}

const ROLE_COLOR: Record<EmployeeRole, string> = {
  ADMIN:     "text-red-600    bg-red-50    border-red-200",
  MANAGER:   "text-violet-600 bg-violet-50 border-violet-200",
  SELLER:    "text-blue-600   bg-blue-50   border-blue-200",
  WAITER:    "text-amber-600  bg-amber-50  border-amber-200",
  CHEF:      "text-orange-600 bg-orange-50 border-orange-200",
  ATTENDANT: "text-teal-600   bg-teal-50   border-teal-200",
};

const ROLE_LABEL: Record<EmployeeRole, string> = {
  ADMIN:     "Admin",
  MANAGER:   "Menejer",
  SELLER:    "Sotuvchi",
  WAITER:    "Ofitsiant",
  CHEF:      "Oshpaz",
  ATTENDANT: "Nazoratchi",
};

export default function Header({
  isOnline, setIsOnline,
  isDark, onToggleDark,
  notifications, unreadCount,
  onMarkRead, onMarkAllRead, onDismiss, onClearAll, onNavigate,
  user, onLogout,
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
            <button onClick={() => setIsOnline(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${isOnline ? "bg-[#1e3d1f] text-white shadow-sm" : "text-[#637063] hover:text-[#1e3d1f] hover:bg-[#eef7ef]"}`}>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Online</span>
            </button>
            <button onClick={() => setIsOnline(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${!isOnline ? "bg-amber-500 text-white shadow-sm" : "text-[#637063] hover:text-amber-700 hover:bg-amber-50"}`}>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </button>
          </div>

          {/* Dark mode toggle */}
          <button onClick={onToggleDark}
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

          {/* ── User menu ── */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all
                  ${userMenuOpen
                    ? "bg-[#1e3d1f] border-[#1e3d1f] text-white"
                    : "bg-white border-[#dedad3] text-[#637063] hover:border-[#4d8751]"
                  }`}
              >
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-[800]
                  ${userMenuOpen ? "bg-white/20 text-white" : "bg-[#d8edda] text-[#1e3d1f]"}`}>
                  {user.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-xs font-[700] leading-none ${userMenuOpen ? "text-white" : "text-[#1e3d1f]"}`}>
                    {user.name.split(" ")[0]}
                  </p>
                  <p className={`text-[10px] font-[600] leading-none mt-0.5 ${userMenuOpen ? "text-white/70" : "text-[#637063]"}`}>
                    {ROLE_LABEL[user.role]}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform hidden sm:block
                  ${userMenuOpen ? "rotate-180 text-white" : "text-[#9daa9e]"}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: .96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1   }}
                    exit={{    opacity: 0, y: -8, scale: .96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-[#dedad3]
                               shadow-xl z-50 overflow-hidden"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    {/* User info */}
                    <div className="px-4 py-3.5 border-b border-[#f0ede8] bg-[#f7f5f2]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#d8edda] flex items-center justify-center
                                        text-base font-[800] text-[#1e3d1f] shrink-0">
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-[800] text-[#1e3d1f] truncate">{user.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`badge border text-[10px] ${ROLE_COLOR[user.role]}`}>
                              {ROLE_LABEL[user.role]}
                            </span>
                            {user.stallName && (
                              <span className="text-[10px] text-[#637063] font-[500]">
                                {user.stallName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stall badge if scoped */}
                    {user.stallName && (
                      <div className="px-4 py-2.5 border-b border-[#f0ede8]">
                        <p className="text-[10px] font-[700] text-[#9daa9e] uppercase tracking-wide mb-1">
                          Biriktirilgan rasta
                        </p>
                        <p className="text-xs font-[700] text-[#1e3d1f]">{user.stallName}</p>
                      </div>
                    )}

                    {/* Menu items */}
                    <div className="p-2">
                      <button
                        onClick={() => { onLogout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                   text-sm font-[700] text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Tizimdan chiqish
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
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

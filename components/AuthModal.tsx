"use client";

import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, CheckCircle2, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Employee, PendingActionType } from "./types";

interface AuthModalProps {
  pendingSellerId: string | null;
  pendingActionType: PendingActionType;
  employees: Employee[];
  authUsername: string;
  authPassword: string;
  authError: string;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onCancel: () => void;
}

export default function AuthModal({
  pendingSellerId,
  pendingActionType,
  employees,
  authUsername,
  authPassword,
  authError,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onCancel,
}: AuthModalProps) {
  const [showPw, setShowPw] = useState(false);
  const targetEmp = employees.find((e) => e.id === pendingSellerId);

  const ROLE_LABEL: Record<string, string> = {
    MANAGER: "Menejer", SELLER: "Sotuvchi",
    ATTENDANT: "Nazoratchi", ADMIN: "Admin",
  };

  return (
    <AnimatePresence>
      {pendingSellerId && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10, 26, 11, 0.72)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{    scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="bg-white rounded-3xl shadow-[var(--shadow-modal)] w-full max-w-md overflow-hidden"
          >
            {/* ── Top accent ── */}
            <div className="h-1 bg-gradient-to-r from-[#1e3d1f] via-[#4d8751] to-[#91c494]" />

            {/* ── Header ── */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d8edda] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#1e3d1f]" />
                </div>
                <div>
                  <h3 className="text-base font-[800] text-[#1e3d1f]">
                    {pendingActionType === "switch_seller"
                      ? "Sotuvchi Avtorizatsiyasi"
                      : "Xodim Avtorizatsiyasi"
                    }
                  </h3>
                  <p className="text-[11px] text-[#637063] mt-0.5">
                    Shaxsingizni tasdiqlang
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="btn-icon mt-1"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ── Employee card ── */}
              {targetEmp && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f7f5f2] border border-[#f0ede8]">
                  <div className="w-11 h-11 rounded-full bg-[#d8edda] flex items-center justify-center text-[#1e3d1f] font-[800] text-base shrink-0">
                    {targetEmp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-[700] text-[#1e3d1f] truncate">{targetEmp.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge badge-green text-[9px]">
                        {ROLE_LABEL[targetEmp.role] ?? targetEmp.role}
                      </span>
                      <span className="text-[10px] font-mono text-[#9daa9e]">{pendingSellerId}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Form ── */}
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="section-label">Foydalanuvchi nomi</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9daa9e] text-sm font-[600] select-none">
                      @
                    </span>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => onUsernameChange(e.target.value)}
                      placeholder="Login..."
                      required
                      className="input pl-8"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="section-label">Parol</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      placeholder="Parolni kiriting..."
                      required
                      className="input font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9daa9e] hover:text-[#637063] transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-[600]"
                    >
                      <X className="w-4 h-4 shrink-0 text-red-500" />
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary flex-1"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tasdiqlash
                  </button>
                </div>
              </form>

              {/* ── Hint box ── */}
              <div className="p-4 rounded-2xl bg-[#f7f5f2] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4d8751]" />
                  <p className="text-[10px] font-[800] text-[#1e3d1f] uppercase tracking-wider">
                    Demo parollar
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[#637063]">
                  {employees.map((e) => (
                    <div key={e.id} className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#d8edda] text-[#1e3d1f] flex items-center justify-center font-[800] text-[9px] shrink-0">
                        {e.name.charAt(0)}
                      </span>
                      <code className="font-mono text-[#283028] font-[700]">{e.username}</code>
                      <span>/</span>
                      <code className="font-mono text-[#283028] font-[700]">{e.password}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

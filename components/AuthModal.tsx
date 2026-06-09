"use client";

import { motion, AnimatePresence } from "motion/react";
import { Lock, Key, CheckCircle2, AlertTriangle } from "lucide-react";
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
  const targetEmp = employees.find((e) => e.id === pendingSellerId);

  return (
    <AnimatePresence>
      {pendingSellerId && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1,    y: 0  }}
            exit={{    scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="bg-white rounded-2xl border border-[#DAD7CD] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#F2F4EF] pb-4">
              <div className="p-3 bg-[#2D452E]/10 rounded-xl text-[#2D452E] shrink-0">
                <Lock className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#2D452E] uppercase tracking-wider">
                  {pendingActionType === "switch_seller"
                    ? "Sotuvchi Avtorizatsiyasi"
                    : "Xodim Avtorizatsiyasi"}
                </h3>
                <p className="text-xs text-[#588157]">
                  Davom etishdan avval shaxsingizni tasdiqlang
                </p>
              </div>
            </div>

            {/* Employee info */}
            {targetEmp && (
              <div className="bg-[#F2F4EF]/60 p-4 rounded-xl border border-[#DAD7CD] text-xs space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#588157] block">
                  Tanlangan Xodim:
                </span>
                <p className="font-bold text-sm text-[#2D452E] flex items-center gap-1.5 flex-wrap">
                  {targetEmp.name}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A3B18A]/20 border border-[#DAD7CD] font-bold">
                    {targetEmp.role}
                  </span>
                </p>
                <p className="text-[9px] text-[#588157] font-mono">
                  ID: <span className="text-[#3A5A40] font-bold">{pendingSellerId}</span>
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#588157] uppercase tracking-wider block">
                  Foydalanuvchi nomi (Login):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3B18A] font-semibold select-none text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    placeholder="Login..."
                    required
                    className="w-full bg-[#F2F4EF]/60 border border-[#DAD7CD] rounded-xl py-2.5 pl-8 pr-4 text-sm font-semibold text-[#2D452E] focus:outline-none focus:border-[#2D452E] focus:ring-1 focus:ring-[#2D452E] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#588157] uppercase tracking-wider block">
                  Tizim Paroli:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3B18A] flex items-center">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="Parolni kiriting..."
                    required
                    className="w-full bg-[#F2F4EF]/60 border border-[#DAD7CD] rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono font-bold text-[#2D452E] focus:outline-none focus:border-[#2D452E] focus:ring-1 focus:ring-[#2D452E] transition-all"
                  />
                </div>
              </div>

              {/* Error */}
              {authError && (
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  {authError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-[#588157] font-bold py-3 rounded-xl text-xs transition-all border border-gray-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#2D452E] hover:bg-[#3A5A40] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Tasdiqlash
                </button>
              </div>
            </form>

            {/* Hint */}
            <div className="pt-2 border-t border-[#F2F4EF] text-[10px] text-[#588157] bg-[#F2F4EF]/40 p-3 rounded-xl space-y-1 leading-relaxed">
              <span className="font-black uppercase tracking-wider text-[#3A5A40] block">
                🔑 Tizim Parollari:
              </span>
              <p>
                • Dilshod: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">dilshod</code> /
                <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold ml-1">111</code>
                {"  "}• Shahzod: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">shahzod</code> /
                <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold ml-1">222</code>
              </p>
              <p>
                • Laylo: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">laylo</code> /
                <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold ml-1">333</code>
                {"  "}• Jamshid: <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold">jamshid</code> /
                <code className="font-mono bg-[#A3B18A]/30 px-1 rounded text-[#2D452E] font-bold ml-1">444</code>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Leaf, Lock, User, AlertCircle } from "lucide-react";
import { INITIAL_EMPLOYEES, INITIAL_STALLS, STALL_TYPE_META } from "../constants";
import type { EmployeeRole } from "../types";

interface LoginPageProps {
  onLogin:     (username: string, password: string) => boolean;
  loginError:  string;
  isLoading:   boolean;
}

// Role badge styling
const ROLE_STYLE: Record<EmployeeRole, { label: string; cls: string; emoji: string }> = {
  ADMIN:     { label: "Admin",       cls: "bg-red-100    text-red-700    border-red-200",    emoji: "🛡️" },
  MANAGER:   { label: "Menejer",     cls: "bg-violet-100 text-violet-700 border-violet-200", emoji: "👑" },
  SELLER:    { label: "Sotuvchi",    cls: "bg-blue-100   text-blue-700   border-blue-200",   emoji: "🛒" },
  WAITER:    { label: "Ofitsiant",   cls: "bg-amber-100  text-amber-700  border-amber-200",  emoji: "🍽️" },
  CHEF:      { label: "Oshpaz",      cls: "bg-orange-100 text-orange-700 border-orange-200", emoji: "👨‍🍳" },
  ATTENDANT: { label: "Nazoratchi",  cls: "bg-teal-100   text-teal-700   border-teal-200",   emoji: "🎟️" },
};

export default function LoginPage({ onLogin, loginError, isLoading }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [touched,  setTouched]  = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (username.trim() && password) {
      onLogin(username, password);
    }
  };

  // Quick-login cards for demo
  const demoUsers = INITIAL_EMPLOYEES.map((emp) => {
    const stall = emp.stallId ? INITIAL_STALLS.find((s) => s.id === emp.stallId) : null;
    return { ...emp, stall };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a0b] via-[#0f2210] to-[#162d17] flex flex-col items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[.06]"
             style={{ background: "radial-gradient(circle, #91c494 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[.04]"
             style={{ background: "radial-gradient(circle, #4d8751 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md space-y-6"
      >
        {/* ── Brand ── */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#1e3d1f] border border-[#2d5230] flex items-center justify-center mx-auto shadow-xl">
            <Leaf className="w-8 h-8 text-[#91c494]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-[800] text-white tracking-tight">Park Central</h1>
            <p className="text-sm text-slate-400 font-[500] mt-1">
              Yagona boshqaruv raqamli ekotizimi
            </p>
          </div>
        </div>

        {/* ── Login card ── */}
        <div className="bg-white/[.07] backdrop-blur-xl border border-white/[.10] rounded-3xl overflow-hidden shadow-2xl">
          <div className="h-0.5 bg-gradient-to-r from-[#4d8751] via-[#91c494] to-transparent" />

          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-[800] text-white">Tizimga kirish</h2>
              <p className="text-sm text-slate-400 mt-1">
                Login va parolingizni kiriting
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-[700] uppercase tracking-wider text-slate-400 block">
                  Foydalanuvchi nomi
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full bg-white/[.06] border rounded-xl py-3 pl-10 pr-4 text-white
                      placeholder-slate-600 font-[500] text-sm focus:outline-none transition-all
                      ${touched && !username.trim()
                        ? "border-red-500/50 focus:border-red-400"
                        : "border-white/10 focus:border-[#4d8751] focus:bg-white/[.09]"
                      }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-[700] uppercase tracking-wider text-slate-400 block">
                  Parol
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-white/[.06] border rounded-xl py-3 pl-10 pr-10 text-white
                      placeholder-slate-600 font-mono font-[600] text-sm focus:outline-none transition-all
                      ${touched && !password
                        ? "border-red-500/50 focus:border-red-400"
                        : "border-white/10 focus:border-[#4d8751] focus:bg-white/[.09]"
                      }`}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-[600]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#1e3d1f] hover:bg-[#2d5230] border border-[#2d5230]
                           text-white font-[800] text-sm transition-all shadow-lg
                           hover:shadow-[#4d8751]/20 hover:shadow-xl
                           disabled:opacity-60 disabled:cursor-not-allowed
                           active:scale-[.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Tekshirilmoqda...
                  </span>
                ) : (
                  "Kirish"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Demo credentials ── */}
        <div className="bg-white/[.04] border border-white/[.08] rounded-2xl p-5 space-y-3">
          <p className="text-[11px] font-[700] text-slate-400 uppercase tracking-wider">
            Demo akkauntlar
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoUsers.map((emp) => {
              const rs = ROLE_STYLE[emp.role];
              const stallMeta = emp.stall ? STALL_TYPE_META[emp.stall.type] : null;
              return (
                <button
                  key={emp.id}
                  onClick={() => { setUsername(emp.username); setPassword(emp.password); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[.04]
                             hover:bg-white/[.08] border border-white/[.06] transition-all text-left group"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#1e3d1f] border border-[#2d5230]
                                  flex items-center justify-center text-sm font-[800] text-[#91c494] shrink-0">
                    {emp.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-[700] text-white">{emp.name}</span>
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-[700] px-1.5 py-0.5 rounded-full border ${rs.cls}`}>
                        {rs.emoji} {rs.label}
                      </span>
                    </div>
                    {emp.stall && stallMeta && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {stallMeta.emoji} {emp.stall.name}
                      </p>
                    )}
                    {!emp.stall && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Barcha rastalar</p>
                    )}
                  </div>

                  {/* Credentials */}
                  <div className="text-right shrink-0">
                    <code className="text-[10px] font-mono text-[#4d8751] bg-[#1e3d1f]/50 px-1.5 py-0.5 rounded">
                      {emp.username} / {emp.password}
                    </code>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-600 text-center">
            Istalgan akkauntga bosing — maydonlar avtomatik to'ldiriladi
          </p>
        </div>
      </motion.div>
    </div>
  );
}

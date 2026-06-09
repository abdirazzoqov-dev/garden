"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Moon, Printer, Download, CheckCircle2, TrendingUp, Users, ShoppingBag, AlertTriangle } from "lucide-react";
import type { Transaction, Order, Employee, Product, Stall } from "../types";
import { formatNumber } from "../utils";

interface DayCloseModalProps {
  stalls:       Stall[];
  transactions: Transaction[];
  orders:       Order[];
  employees:    Employee[];
  products:     Product[];
  onClose:      () => void;
  onConfirm:    () => void;
}

export default function DayCloseModal({
  stalls, transactions, orders, employees, products, onClose, onConfirm,
}: DayCloseModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Compute day stats ─────────────────────────────────────
  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const totalOrders  = transactions.length;
  const avgCheck     = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const paidOrders   = orders.filter((o) => o.status === "PAID").length;
  const cancelOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const activeStaff  = employees.filter((e) => e.isCheckedIn).length;
  const lowStock     = products.filter((p) => p.stock <= p.minStockAlert).length;

  const now     = new Date();
  const dateStr = now.toLocaleDateString("uz-UZ");
  const timeStr = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false });

  // Per-stall breakdown
  const stallBreakdown = stalls.map((s) => ({
    name:    s.name,
    emoji:   s.type === "FASTFOOD" ? "🍔" : s.type === "TEAHOUSE" ? "🫖" : s.type === "CAFE" ? "☕" : s.type === "ATTRACTION" ? "🎢" : "🛍️",
    revenue: transactions.filter((t) => t.stallId === s.id).reduce((sum, t) => sum + t.amount, 0),
    count:   transactions.filter((t) => t.stallId === s.id).length,
  })).filter((s) => s.count > 0).sort((a, b) => b.revenue - a.revenue);

  // Payment method breakdown
  const cashTotal   = transactions.filter((t) => t.paymentMethod === "CASH"  ).reduce((s, t) => s + t.amount, 0);
  const cardTotal   = transactions.filter((t) => t.paymentMethod === "CARD"  ).reduce((s, t) => s + t.amount, 0);
  const mobileTotal = transactions.filter((t) => t.paymentMethod === "MOBILE").reduce((s, t) => s + t.amount, 0);

  // Employee summary
  const empSummary = employees
    .map((e) => ({
      name:    e.name,
      revenue: transactions.filter((t) => t.employeeId === e.id).reduce((s, t) => s + t.amount, 0),
      count:   transactions.filter((t) => t.employeeId === e.id).length,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const handlePrint = () => {
    if (!reportRef.current) return;
    const win = window.open("", "_blank", "width=600,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Smena hisoboti — Park Central</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 16px; color: #000; }
        h1 { font-size: 18px; text-align: center; margin-bottom: 8px; }
        h2 { font-size: 13px; margin: 12px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .bold { font-weight: bold; }
        .total { font-size: 15px; font-weight: bold; background: #f0f0f0; padding: 6px 8px; border-radius: 4px; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin: 6px 0; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; font-size: 11px; }
        th { background: #f5f5f5; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style></head><body>${reportRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,26,11,.75)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: .93, y: 20 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: .93, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8] bg-gradient-to-r from-[#0a1a0b] to-[#162d17]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e3d1f] border border-[#2d5230] flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#91c494]" />
              </div>
              <div>
                <h3 className="text-base font-[800] text-white">Smena yakunlash</h3>
                <p className="text-[11px] text-slate-400">{dateStr} — {timeStr}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Report content */}
          <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
            <div ref={reportRef}>
              {/* Title for print */}
              <h1 className="hidden print:block text-center text-xl font-bold mb-2">
                🌿 Park Central — Smena Hisoboti
              </h1>
              <p className="hidden print:block text-center text-sm text-gray-500 mb-4">
                {dateStr} | {timeStr}
              </p>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Jami tushum",    value: `${formatNumber(totalRevenue)} so'm`, icon: <TrendingUp className="w-4 h-4" />, cls: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { label: "Tranzaksiyalar", value: `${totalOrders} ta`,                  icon: <ShoppingBag className="w-4 h-4" />, cls: "text-blue-600 bg-blue-50 border-blue-100"           },
                  { label: "O'rtacha chek",  value: `${formatNumber(avgCheck)} so'm`,     icon: <CheckCircle2 className="w-4 h-4"/>, cls: "text-violet-600 bg-violet-50 border-violet-100"    },
                  { label: "Kam zaxira",     value: `${lowStock} ta`,                     icon: <AlertTriangle className="w-4 h-4"/>,cls: lowStock > 0 ? "text-red-600 bg-red-50 border-red-100" : "text-slate-400 bg-slate-50 border-slate-100" },
                ].map((c) => (
                  <div key={c.label} className={`p-3 rounded-2xl border flex flex-col items-center gap-1 text-center ${c.cls}`}>
                    {c.icon}
                    <p className="text-base font-[800] font-mono leading-none">{c.value}</p>
                    <p className="text-[10px] font-[600]">{c.label}</p>
                  </div>
                ))}
              </div>

              {/* Stall breakdown */}
              <h2 className="text-sm font-[800] text-[#1e3d1f] mb-3 flex items-center gap-2">
                <span>📊</span> Rastalar bo'yicha tushum
              </h2>
              {stallBreakdown.length === 0 ? (
                <p className="text-[#9daa9e] text-sm mb-4">Bugun sotuv bo'lmadi</p>
              ) : (
                <div className="card overflow-hidden mb-5">
                  <table className="data-table">
                    <thead><tr><th>Rasta</th><th className="text-right">Tranzaksiya</th><th className="text-right">Tushum</th></tr></thead>
                    <tbody>
                      {stallBreakdown.map((s) => (
                        <tr key={s.name}>
                          <td><span className="mr-1.5">{s.emoji}</span><span className="font-[700] text-[#1e3d1f]">{s.name}</span></td>
                          <td className="text-right font-mono">{s.count} ta</td>
                          <td className="text-right font-[800] font-mono text-[#1e3d1f]">{formatNumber(s.revenue)} so'm</td>
                        </tr>
                      ))}
                      <tr className="font-[800] bg-[#f7f5f2]">
                        <td>Jami</td>
                        <td className="text-right font-mono">{totalOrders} ta</td>
                        <td className="text-right font-mono text-emerald-700">{formatNumber(totalRevenue)} so'm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Payment breakdown */}
              <h2 className="text-sm font-[800] text-[#1e3d1f] mb-3 flex items-center gap-2">
                <span>💳</span> To'lov usullari
              </h2>
              <div className="card overflow-hidden mb-5">
                <table className="data-table">
                  <thead><tr><th>Usul</th><th className="text-right">Summa</th><th className="text-right">Ulushi</th></tr></thead>
                  <tbody>
                    {[
                      { label: "💵 Naqd",        val: cashTotal   },
                      { label: "💳 Karta",        val: cardTotal   },
                      { label: "📱 Click/Payme",  val: mobileTotal },
                    ].map((p) => (
                      <tr key={p.label}>
                        <td className="font-[600]">{p.label}</td>
                        <td className="text-right font-mono">{formatNumber(p.val)} so'm</td>
                        <td className="text-right text-[#637063]">
                          {totalRevenue > 0 ? `${Math.round((p.val / totalRevenue) * 100)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Employee summary */}
              {empSummary.length > 0 && (
                <>
                  <h2 className="text-sm font-[800] text-[#1e3d1f] mb-3 flex items-center gap-2">
                    <span>👥</span> Xodimlar samaradorligi
                  </h2>
                  <div className="card overflow-hidden mb-5">
                    <table className="data-table">
                      <thead><tr><th>Xodim</th><th className="text-right">Sotuv</th><th className="text-right">Tushum</th></tr></thead>
                      <tbody>
                        {empSummary.map((e, i) => (
                          <tr key={e.name}>
                            <td>
                              <div className="flex items-center gap-2">
                                {i === 0 && <span>🏆</span>}
                                <span className="font-[700] text-[#1e3d1f]">{e.name}</span>
                              </div>
                            </td>
                            <td className="text-right font-mono">{e.count} ta</td>
                            <td className="text-right font-[800] font-mono text-[#1e3d1f]">{formatNumber(e.revenue)} so'm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Warnings */}
              {(activeStaff > 0 || lowStock > 0) && (
                <div className="space-y-2">
                  {activeStaff > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-[700]">
                      <Users className="w-4 h-4 shrink-0" />
                      {activeStaff} ta xodim hali check-out qilmagan
                    </div>
                  )}
                  {lowStock > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-[700]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {lowStock} ta mahsulot zaxirasi kam — ertaga to'ldiring
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#f0ede8] bg-[#f7f5f2]">
            <button onClick={onClose} className="btn btn-secondary flex-1 btn-sm">
              Bekor qilish
            </button>
            <button onClick={handlePrint} className="btn btn-sm flex-1 bg-slate-700 hover:bg-slate-800 text-white border-0">
              <Printer className="w-3.5 h-3.5" /> Hisobotni chop etish
            </button>
            <button onClick={onConfirm} className="btn btn-primary flex-1 btn-sm bg-[#1e3d1f]">
              <Moon className="w-3.5 h-3.5" /> Smenani yopish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

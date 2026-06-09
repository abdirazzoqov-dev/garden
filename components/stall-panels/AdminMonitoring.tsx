"use client";

import { motion } from "motion/react";
import {
  Activity, AlertTriangle, DollarSign, ShoppingBag,
  LayoutGrid, Users, Clock, TrendingUp, WifiOff,
  CheckCircle2, XCircle,
} from "lucide-react";
import type {
  Stall, Product, Transaction, Order, Table, Employee,
} from "../types";
import { STALL_TYPE_META, STALL_STATUS_META } from "../constants";
import { formatNumber } from "../utils";
import { computeStallMetrics } from "./utils";

interface AdminMonitoringProps {
  stalls:       Stall[];
  products:     Product[];
  transactions: Transaction[];
  orders:       Order[];
  tables:       Table[];
  employees:    Employee[];
  isOnline:     boolean;
  wsEvents:     { id: string; time: string; text: string; type: string }[];
  onSelectStall: (stallId: string) => void;
}

export default function AdminMonitoring({
  stalls, products, transactions, orders, tables, employees,
  isOnline, wsEvents, onSelectStall,
}: AdminMonitoringProps) {

  // ── Park-wide totals ──────────────────────────────────────
  const totalRevenue  = transactions.reduce((s, t) => s + t.amount, 0);
  const totalOrders   = transactions.length;
  const totalActive   = orders.filter(
    (o) => o.status !== "PAID" && o.status !== "CANCELLED"
  ).length;
  const totalLowStock = products.filter((p) => p.stock <= p.minStockAlert).length;
  const totalStaff    = employees.filter((e) => e.isCheckedIn).length;
  const totalTables   = tables.length;
  const bandTables    = tables.filter(
    (t) => t.status === "OCCUPIED" || t.status === "BILL_REQUESTED"
  ).length;

  // ── Per-stall metrics ─────────────────────────────────────
  const stallMetrics = stalls.map((s) =>
    computeStallMetrics(s, products, transactions, orders, tables, employees)
  );

  // Sort by revenue desc for leaderboard
  const sorted = [...stalls]
    .map((s, i) => ({ stall: s, metrics: stallMetrics[i] }))
    .sort((a, b) => b.metrics.revenue - a.metrics.revenue);

  const maxRevenue = sorted[0]?.metrics.revenue ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      {/* ══ PARK-WIDE KPI STRIP ══════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Jami tushum",
            value: `${formatNumber(Math.round(totalRevenue / 1000))}k`,
            unit: "so'm",
            icon: <DollarSign className="w-4 h-4" />,
            cls: "text-emerald-400", border: "border-emerald-500/30",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Tranzaksiyalar",
            value: totalOrders,
            unit: "ta",
            icon: <ShoppingBag className="w-4 h-4" />,
            cls: "text-blue-400", border: "border-blue-500/30",
            bg: "bg-blue-500/10",
          },
          {
            label: "Faol buyurtma",
            value: totalActive,
            unit: "ta",
            icon: <Clock className="w-4 h-4" />,
            cls: totalActive > 0 ? "text-amber-400" : "text-slate-500",
            border: totalActive > 0 ? "border-amber-500/30" : "border-slate-700",
            bg: totalActive > 0 ? "bg-amber-500/10" : "bg-slate-800",
          },
          {
            label: "Kam zaxira",
            value: totalLowStock,
            unit: "ta",
            icon: <AlertTriangle className="w-4 h-4" />,
            cls: totalLowStock > 0 ? "text-red-400" : "text-slate-500",
            border: totalLowStock > 0 ? "border-red-500/30" : "border-slate-700",
            bg: totalLowStock > 0 ? "bg-red-500/10" : "bg-slate-800",
          },
          {
            label: "Band stollar",
            value: `${bandTables}/${totalTables}`,
            unit: "",
            icon: <LayoutGrid className="w-4 h-4" />,
            cls: "text-violet-400", border: "border-violet-500/30",
            bg: "bg-violet-500/10",
          },
          {
            label: "Xodimlar",
            value: totalStaff,
            unit: "faol",
            icon: <Users className="w-4 h-4" />,
            cls: "text-indigo-400", border: "border-indigo-500/30",
            bg: "bg-indigo-500/10",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="metric-card"
          >
            <div className="relative flex flex-col items-center text-center gap-1.5">
              <div className={`p-2 rounded-xl border ${c.bg} ${c.border} ${c.cls}`}>
                {c.icon}
              </div>
              <p className={`text-xl font-[800] leading-none font-mono ${c.cls}`}>
                {c.value}
                {c.unit && (
                  <span className="text-[10px] font-[600] text-slate-400 ml-0.5">{c.unit}</span>
                )}
              </p>
              <p className="text-[10px] font-[600] text-slate-500 leading-tight">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ STALL PERFORMANCE LEADERBOARD ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue ranking */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4d8751]" />
              <h4 className="text-sm font-[800] text-[#1e3d1f]">Rastalar reytingi</h4>
            </div>
            <span className="badge badge-green text-[10px]">Bugungi tushum</span>
          </div>
          <div className="space-y-3">
            {sorted.map(({ stall: s, metrics: m }, i) => {
              const meta = STALL_TYPE_META[s.type];
              const pct  = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      onClick={() => onSelectStall(s.id)}
                      className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity text-left"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[800] shrink-0
                        ${i === 0 ? "bg-amber-400 text-white"
                          : i === 1 ? "bg-slate-300 text-slate-700"
                          : i === 2 ? "bg-amber-700 text-white"
                          : "bg-[#f0ede8] text-[#637063]"}`}>
                        {i + 1}
                      </span>
                      <span className="text-base shrink-0">{meta.emoji}</span>
                      <span className="text-xs font-[700] text-[#1e3d1f] truncate">{s.name}</span>
                      {s.status !== "ACTIVE" && (
                        <span className={`badge text-[9px] ${STALL_STATUS_META[s.status].badge}`}>
                          {STALL_STATUS_META[s.status].label}
                        </span>
                      )}
                    </button>
                    <span className="text-xs font-[800] font-mono text-[#1e3d1f] shrink-0 ml-2">
                      {formatNumber(m.revenue)} so'm
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [.22, 1, .36, 1] }}
                      className={`h-full rounded-full ${
                        i === 0 ? "bg-gradient-to-r from-amber-500 to-amber-300"
                        : i === 1 ? "bg-gradient-to-r from-slate-400 to-slate-300"
                        : "bg-gradient-to-r from-[#4d8751] to-[#91c494]"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stall status grid */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4d8751]" />
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Real-vaqt holati</h4>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {stalls.map((s) => {
              const meta    = STALL_TYPE_META[s.type];
              const m       = stallMetrics[stalls.indexOf(s)];
              const isActive = s.status === "ACTIVE";
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectStall(s.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#f0ede8] hover:border-[#4d8751] hover:bg-[#f7f5f2] transition-all text-left group"
                >
                  {/* Status dot */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    s.status === "ACTIVE" ? "bg-emerald-500 pulse-dot"
                    : s.status === "MAINTENANCE" ? "bg-amber-400"
                    : "bg-slate-300"
                  }`} />

                  {/* Emoji + name */}
                  <span className="text-lg shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-[700] text-[#1e3d1f] truncate group-hover:text-[#4d8751] transition-colors">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-[#9daa9e] font-[500]">{meta.label}</p>
                  </div>

                  {/* Mini stats */}
                  <div className="flex items-center gap-3 shrink-0">
                    {m.activeOrders > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-[700] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-2.5 h-2.5" />
                        {m.activeOrders}
                      </span>
                    )}
                    {m.lowStockCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-[700] text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {m.lowStockCount}
                      </span>
                    )}
                    {m.tablesTotal > 0 && (
                      <span className="text-[10px] font-[700] text-[#637063]">
                        {m.tablesOccupied}/{m.tablesTotal}🪑
                      </span>
                    )}
                    <span className="text-xs font-[800] font-mono text-[#1e3d1f]">
                      {formatNumber(Math.round(m.revenue / 1000))}k
                    </span>
                    <span className="text-[#9daa9e] group-hover:text-[#4d8751] transition-colors text-xs">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ ALERT CENTER ════════════════════════════════════ */}
      {(totalLowStock > 0 || !isOnline) && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Diqqat markazlari</h4>
          </div>
          <div className="space-y-2">
            {/* Offline alert */}
            {!isOnline && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs font-[700] text-amber-800">
                  Tizim offline rejimda — tranzaksiyalar mahalliy xotirada saqlanmoqda
                </p>
              </div>
            )}
            {/* Low stock alerts */}
            {products
              .filter((p) => p.stock <= p.minStockAlert)
              .slice(0, 5)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-[700] text-red-800">
                      {p.name}
                      <span className="font-[500] text-red-600 ml-1">— {p.stallName}</span>
                    </p>
                  </div>
                  <span className="badge badge-red text-[10px] font-mono shrink-0">
                    {p.stock} {p.unit ?? "dona"} qoldi
                  </span>
                </div>
              ))}
            {totalLowStock > 5 && (
              <p className="text-xs text-[#9daa9e] text-center font-[600]">
                +{totalLowStock - 5} ta boshqa mahsulot ham kam
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══ LIVE ACTIVITY FEED ══════════════════════════════ */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4d8751]" />
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Park jonli faollik lenti</h4>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-[700] text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
            Jonli
          </span>
        </div>
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {wsEvents.slice(0, 15).map((ev) => (
            <div
              key={ev.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-[11px]
                ${ev.type === "success" ? "bg-emerald-50 border-emerald-100"
                  : ev.type === "warning" ? "bg-amber-50 border-amber-100"
                  : "bg-[#f7f5f2] border-[#f0ede8]"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0
                ${ev.type === "success" ? "bg-emerald-500"
                  : ev.type === "warning" ? "bg-amber-500"
                  : "bg-[#4d8751]"}`}
              />
              <div className="flex-1 min-w-0">
                <p className={`leading-relaxed ${
                  ev.type === "success" ? "text-emerald-800"
                  : ev.type === "warning" ? "text-amber-800"
                  : "text-[#283028]"}`}>
                  {ev.text}
                </p>
                <p className="font-mono text-[9px] text-[#9daa9e] mt-0.5">{ev.time}</p>
              </div>
            </div>
          ))}
          {wsEvents.length === 0 && (
            <p className="text-[#9daa9e] text-sm py-6 text-center">Hozircha faollik yo'q</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

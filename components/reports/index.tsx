"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, TrendingDown, Download,
  Calendar, DollarSign, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, Filter,
} from "lucide-react";
import type { Transaction, Product, Employee, Stall, Order } from "../types";
import { PRODUCT_CATEGORY_META, STALL_TYPE_META } from "../constants";
import { formatNumber } from "../utils";

interface ReportsTabProps {
  transactions: Transaction[];
  orders:       Order[];
  products:     Product[];
  employees:    Employee[];
  stalls:       Stall[];
}

type DateRange = "today" | "week" | "month" | "custom";

// ── Helpers ──────────────────────────────────────────────────
function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function mockDailyRevenue(transactions: Transaction[], days: number) {
  // Simulate data for past N days based on current transactions total
  const base = transactions.reduce((s, t) => s + t.amount, 0);
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    amount: Math.round(base * (0.5 + Math.random() * 1.2)),
  }));
}

const HOUR_LABELS = ["08","09","10","11","12","13","14","15","16","17","18","19","20","21","22"];

export default function ReportsTab({
  transactions, orders, products, employees, stalls,
}: ReportsTabProps) {
  const [range,      setRange]      = useState<DateRange>("today");
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");

  // ── Computed metrics ────────────────────────────────────────

  const totalRevenue     = transactions.reduce((s, t) => s + t.amount, 0);
  const totalOrders      = transactions.length;
  const avgOrderValue    = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalItemsSold   = transactions.reduce((s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0), 0);

  const paidOrders       = orders.filter((o) => o.status === "PAID");
  const cancelledOrders  = orders.filter((o) => o.status === "CANCELLED");
  const cancelRate       = orders.length > 0 ? Math.round((cancelledOrders.length / orders.length) * 100) : 0;

  // Revenue by stall
  const stallRevenue = stalls.map((st) => ({
    ...st,
    revenue: transactions.filter((t) => t.stallId === st.id).reduce((s, t) => s + t.amount, 0),
    txCount: transactions.filter((t) => t.stallId === st.id).length,
  })).sort((a, b) => b.revenue - a.revenue);

  const maxStallRevenue = Math.max(...stallRevenue.map((s) => s.revenue), 1);

  // Revenue by payment method
  const paymentBreakdown = {
    CASH:   transactions.filter((t) => t.paymentMethod === "CASH").reduce((s, t) => s + t.amount, 0),
    CARD:   transactions.filter((t) => t.paymentMethod === "CARD").reduce((s, t) => s + t.amount, 0),
    MOBILE: transactions.filter((t) => t.paymentMethod === "MOBILE").reduce((s, t) => s + t.amount, 0),
  };

  // Top products by revenue
  const productRevenue: Record<string, { name: string; revenue: number; qty: number; category: string }> = {};
  transactions.forEach((t) => t.items.forEach((item) => {
    if (!productRevenue[item.productName]) {
      productRevenue[item.productName] = { name: item.productName, revenue: 0, qty: 0, category: "OTHER" };
    }
    productRevenue[item.productName].revenue += item.price * item.quantity;
    productRevenue[item.productName].qty     += item.quantity;
  }));
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Top employees by sales
  const empRevenue = employees.map((e) => ({
    ...e,
    revenue:  transactions.filter((t) => t.employeeId === e.id).reduce((s, t) => s + t.amount, 0),
    txCount:  transactions.filter((t) => t.employeeId === e.id).length,
  })).sort((a, b) => b.revenue - a.revenue);

  // Hourly distribution (simulated from transaction times)
  const hourlyData = HOUR_LABELS.map((h) => {
    const hNum  = Number(h);
    const count = transactions.filter((t) => {
      const tHour = Number(t.createdAt.split(":")[0]);
      return tHour === hNum;
    }).length;
    // Add some simulated variance
    const simulated = count + Math.floor(Math.random() * 3);
    return { hour: `${h}:00`, count: simulated };
  });
  const maxHourly = Math.max(...hourlyData.map((d) => d.count), 1);

  // Daily revenue mock (week)
  const weeklyData = mockDailyRevenue(transactions, 7);
  const maxWeekly  = Math.max(...weeklyData.map((d) => d.amount), 1);

  // Category breakdown
  const categoryRevenue: Record<string, number> = {};
  transactions.forEach((t) => t.items.forEach((item) => {
    const prod = products.find((p) => p.name === item.productName);
    const cat  = prod?.category ?? "OTHER";
    categoryRevenue[cat] = (categoryRevenue[cat] ?? 0) + item.price * item.quantity;
  }));
  const categorySorted = Object.entries(categoryRevenue)
    .map(([k, v]) => ({ cat: k, amount: v }))
    .sort((a, b) => b.amount - a.amount);
  const maxCat = Math.max(...categorySorted.map((c) => c.amount), 1);

  // Low stock items
  const lowStock = products.filter((p) => p.stock <= p.minStockAlert).length;
  const outStock = products.filter((p) => p.stock <= 0).length;

  // Export CSV
  const exportCSV = () => {
    const header = "ID,Vaqt,Rasta,Xodim,Mahsulotlar,To'lov,Summa,Status\n";
    const rows   = transactions.map((t) =>
      `"${t.id}","${t.createdAt}","${t.stallName}","${t.employeeName}","${t.items.map((i) => `${i.productName}×${i.quantity}`).join("; ")}","${t.paymentMethod}",${t.amount},"${t.syncStatus}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "park_central_hisobot.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      key="reports"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-[800] text-[#1e3d1f] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#4d8751]" />
            Kengaytirilgan Hisobot & Tahlil
          </h2>
          <p className="text-[11px] text-[#637063] mt-0.5">
            Savdo dinamikasi, xodimlar KPI va mahsulotlar tahlili
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-xl border border-[#dedad3]">
            {(["today","week","month"] as DateRange[]).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                  ${range === r ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]" : "text-[#637063]"}`}>
                {r === "today" ? "Bugun" : r === "week" ? "Hafta" : "Oy"}
              </button>
            ))}
          </div>

          {/* Export */}
          <button onClick={exportCSV}
            className="btn btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Jami tushum",
            value: `${formatNumber(totalRevenue)} so'm`,
            sub: `${totalOrders} ta tranzaksiya`,
            icon: <DollarSign className="w-5 h-5" />,
            trend: +12,
            cls: "text-emerald-400",
            bg: "bg-emerald-500/15 border-emerald-500/20",
          },
          {
            label: "O'rtacha chek",
            value: `${formatNumber(avgOrderValue)} so'm`,
            sub: "Har bir buyurtma",
            icon: <TrendingUp className="w-5 h-5" />,
            trend: +5,
            cls: "text-blue-400",
            bg: "bg-blue-500/15 border-blue-500/20",
          },
          {
            label: "Sotilgan mahsulotlar",
            value: `${totalItemsSold} dona`,
            sub: "Barcha rastalar",
            icon: <ShoppingBag className="w-5 h-5" />,
            trend: +8,
            cls: "text-violet-400",
            bg: "bg-violet-500/15 border-violet-500/20",
          },
          {
            label: "Bekor qilish %",
            value: `${cancelRate}%`,
            sub: `${cancelledOrders.length} ta bekor qilindi`,
            icon: <Package className="w-5 h-5" />,
            trend: cancelRate > 5 ? -cancelRate : +2,
            cls: cancelRate > 5 ? "text-red-400" : "text-amber-400",
            bg: cancelRate > 5 ? "bg-red-500/15 border-red-500/20" : "bg-amber-500/15 border-amber-500/20",
          },
        ].map((c) => (
          <div key={c.label} className="metric-card">
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-[700] uppercase tracking-[.08em] text-slate-400 mb-1.5">{c.label}</p>
                <p className="text-xl font-[800] text-white font-mono leading-none truncate">{c.value}</p>
                <p className="text-[11px] text-slate-500 mt-1">{c.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl border shrink-0 ${c.cls} ${c.bg}`}>{c.icon}</div>
            </div>
            {/* Trend */}
            <div className={`flex items-center gap-1 mt-2 text-[11px] font-[700]
              ${c.trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {c.trend > 0
                ? <ArrowUpRight className="w-3.5 h-3.5" />
                : <ArrowDownRight className="w-3.5 h-3.5" />
              }
              {Math.abs(c.trend)}% kecha nisbatan
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1: weekly + hourly ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Weekly revenue chart */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-[800] text-[#1e3d1f]">Haftalik tushum dinamikasi</h4>
              <p className="text-[11px] text-[#637063]">Oxirgi 7 kun (simulyatsiya)</p>
            </div>
            <span className="badge badge-green">Jonli</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map((d, i) => {
              const pct = (d.amount / maxWeekly) * 100;
              const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
              const isToday = i === weeklyData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <p className="text-[9px] font-[700] font-mono text-[#637063] opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatNumber(Math.round(d.amount / 1000))}k
                  </p>
                  <div className="w-full relative flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 3)}%` }}
                      transition={{ duration: 0.7, delay: i * 0.06, ease: [.22, 1, .36, 1] }}
                      className={`w-full rounded-t-lg transition-colors
                        ${isToday
                          ? "bg-gradient-to-t from-[#1e3d1f] to-[#4d8751]"
                          : "bg-gradient-to-t from-[#dedad3] to-[#c8c4b8] group-hover:from-[#4d8751]/40 group-hover:to-[#91c494]/40"
                        }`}
                    />
                  </div>
                  <p className={`text-[10px] font-[700] ${isToday ? "text-[#1e3d1f]" : "text-[#9daa9e]"}`}>{days[i]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly distribution */}
        <div className="card p-5 space-y-4">
          <div>
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Soatlik faollik</h4>
            <p className="text-[11px] text-[#637063]">Tranzaksiyalar soatlar bo'yicha</p>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {hourlyData.map((d, i) => {
              const pct     = (d.count / maxHourly) * 100;
              const isPeak  = d.count === Math.max(...hourlyData.map((x) => x.count));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full relative flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 2)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                      className={`w-full rounded-t-md ${isPeak ? "bg-amber-400" : "bg-[#b8d9ba] group-hover:bg-[#4d8751]"} transition-colors`}
                    />
                  </div>
                  {i % 3 === 0 && (
                    <p className="text-[9px] text-[#9daa9e] font-mono">{d.hour.slice(0, 2)}</p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-amber-600 font-[700]">
            🔥 Eng faol vaqt: {hourlyData.reduce((a, b) => b.count > a.count ? b : a).hour}
          </p>
        </div>
      </div>

      {/* ── Charts row 2: stall perf + category ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Stall performance */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-[800] text-[#1e3d1f]">Rastalar samaradorligi</h4>
              <p className="text-[11px] text-[#637063]">Tushum va tranzaksiyalar soni</p>
            </div>
          </div>
          <div className="space-y-3">
            {stallRevenue.map((st, i) => {
              const meta = STALL_TYPE_META[st.type];
              const pct  = (st.revenue / maxStallRevenue) * 100;
              return (
                <div key={st.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{meta.emoji}</span>
                      <span className="font-[700] text-[#1e3d1f] truncate">{st.name}</span>
                      <span className="text-[#9daa9e] shrink-0">{st.txCount} ta</span>
                    </div>
                    <span className="font-[800] text-[#1e3d1f] font-mono shrink-0">
                      {formatNumber(st.revenue)} so'm
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        i === 0 ? "bg-gradient-to-r from-[#1e3d1f] to-[#4d8751]"
                        : i === 1 ? "bg-gradient-to-r from-blue-600 to-blue-400"
                        : i === 2 ? "bg-gradient-to-r from-violet-600 to-violet-400"
                        : "bg-gradient-to-r from-amber-500 to-amber-300"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-5 space-y-4">
          <div>
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Kategoriyalar bo'yicha tushum</h4>
            <p className="text-[11px] text-[#637063]">Mahsulot turlari ulushi</p>
          </div>
          {categorySorted.length === 0 ? (
            <p className="text-[#9daa9e] text-sm font-[600] py-6 text-center">Ma'lumot yo'q</p>
          ) : (
            <div className="space-y-3">
              {categorySorted.slice(0, 6).map(({ cat, amount }, i) => {
                const catMeta = PRODUCT_CATEGORY_META[cat as keyof typeof PRODUCT_CATEGORY_META];
                const pct     = (amount / maxCat) * 100;
                const share   = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{catMeta?.emoji ?? "📦"}</span>
                        <span className="font-[700] text-[#1e3d1f]">{catMeta?.label ?? cat}</span>
                        <span className="text-[10px] text-[#9daa9e]">{share}%</span>
                      </div>
                      <span className="font-[800] text-[#1e3d1f] font-mono">{formatNumber(amount)}</span>
                    </div>
                    <div className="h-2 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Payment methods + Top products + Staff ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Payment breakdown */}
        <div className="card p-5 space-y-4">
          <h4 className="text-sm font-[800] text-[#1e3d1f]">To'lov usullari</h4>
          <div className="space-y-3">
            {[
              { key: "CASH",   label: "💵 Naqd",       cls: "bg-emerald-500" },
              { key: "CARD",   label: "💳 Karta",       cls: "bg-blue-500"    },
              { key: "MOBILE", label: "📱 Click/Payme", cls: "bg-violet-500"  },
            ].map(({ key, label, cls }) => {
              const amount = paymentBreakdown[key as keyof typeof paymentBreakdown];
              const pct    = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-[700]">
                    <span className="text-[#637063]">{label}</span>
                    <span className="text-[#1e3d1f] font-mono">{pct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#f0ede8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${cls}`}
                      />
                    </div>
                    <span className="text-[10px] text-[#9daa9e] font-mono w-20 text-right shrink-0">
                      {formatNumber(amount)} so'm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Total */}
          <div className="pt-2 border-t border-[#f0ede8] flex justify-between text-sm">
            <span className="font-[700] text-[#637063]">Jami</span>
            <span className="font-[800] text-[#1e3d1f] font-mono">{formatNumber(totalRevenue)} so'm</span>
          </div>
        </div>

        {/* Top products */}
        <div className="card p-5 space-y-4">
          <h4 className="text-sm font-[800] text-[#1e3d1f]">Top mahsulotlar</h4>
          {topProducts.length === 0 ? (
            <p className="text-[#9daa9e] text-sm text-center py-6">Ma'lumot yo'q</p>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-[800] shrink-0
                    ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-amber-700 text-white" : "bg-[#f0ede8] text-[#637063]"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-[700] text-[#1e3d1f] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#9daa9e]">{p.qty} dona sotildi</p>
                  </div>
                  <span className="text-xs font-[800] text-[#1e3d1f] font-mono shrink-0">
                    {formatNumber(p.revenue)} so'm
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff performance */}
        <div className="card p-5 space-y-4">
          <h4 className="text-sm font-[800] text-[#1e3d1f]">Xodimlar samaradorligi</h4>
          <div className="space-y-2.5">
            {empRevenue.filter((e) => e.txCount > 0).map((e, i) => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d8edda] text-[#1e3d1f] flex items-center justify-center text-xs font-[800] shrink-0">
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-[700] text-[#1e3d1f] truncate">{e.name}</p>
                  <p className="text-[10px] text-[#9daa9e]">{e.txCount} ta tranzaksiya</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-[800] text-[#1e3d1f] font-mono">{formatNumber(e.revenue)} so'm</p>
                  {i === 0 && <p className="text-[9px] text-amber-600 font-[700]">🏆 Top</p>}
                </div>
              </div>
            ))}
            {empRevenue.every((e) => e.txCount === 0) && (
              <p className="text-[#9daa9e] text-sm text-center py-4">Hali sotuv yo'q</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stock & inventory alert summary ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-[800] text-[#1e3d1f]">Zaxira holati xulosasi</h4>
          <div className="flex gap-2">
            {outStock > 0 && (
              <span className="badge badge-red">🔴 {outStock} ta tugagan</span>
            )}
            {lowStock > 0 && (
              <span className="badge badge-amber">⚠️ {lowStock} ta kam</span>
            )}
            {lowStock === 0 && outStock === 0 && (
              <span className="badge badge-green">✅ Hammasi yaxshi</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mahsulot</th>
                <th>Rasta</th>
                <th>Kategoriya</th>
                <th className="text-right">Narx</th>
                <th className="text-center">Zaxira</th>
                <th className="text-center">Min chegara</th>
                <th className="text-center">Holat</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) => p.stock <= p.minStockAlert)
                .sort((a, b) => a.stock - b.stock)
                .map((p) => {
                  const isEmpty = p.stock <= 0;
                  const catMeta = PRODUCT_CATEGORY_META[p.category];
                  return (
                    <tr key={p.id}>
                      <td><p className="font-[700] text-[#1e3d1f] text-xs">{p.name}</p></td>
                      <td><span className="text-xs text-[#637063]">{p.stallName}</span></td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-[#637063]">
                          {catMeta.emoji} {catMeta.label}
                        </span>
                      </td>
                      <td className="text-right font-mono font-[700] text-xs">{formatNumber(p.price)}</td>
                      <td className="text-center">
                        <span className={`badge text-[10px] font-mono ${isEmpty ? "badge-red" : "badge-amber"}`}>
                          {p.stock} {p.unit ?? "dona"}
                        </span>
                      </td>
                      <td className="text-center text-xs font-mono text-[#637063]">{p.minStockAlert}</td>
                      <td className="text-center">
                        {isEmpty
                          ? <span className="badge badge-red">❌ Tugagan</span>
                          : <span className="badge badge-amber">⚠ To'ldiring</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              {products.filter((p) => p.stock <= p.minStockAlert).length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#9daa9e]">
                    ✅ Barcha mahsulotlar yetarli zaxirada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

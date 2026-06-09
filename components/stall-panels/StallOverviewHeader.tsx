"use client";

import {
  DollarSign, ShoppingBag, AlertTriangle,
  Users, LayoutGrid, Clock, TrendingUp,
} from "lucide-react";
import type { Stall, Transaction, Order, StallMetrics } from "../types";
import { STALL_TYPE_META, STALL_STATUS_META } from "../constants";
import { formatNumber } from "../utils";
import { motion } from "motion/react";

interface StallOverviewHeaderProps {
  stall:        Stall;
  metrics:      StallMetrics;
  transactions: Transaction[];
  orders:       Order[];
}

export default function StallOverviewHeader({
  stall, metrics, transactions, orders,
}: StallOverviewHeaderProps) {
  const typeMeta   = STALL_TYPE_META[stall.type];
  const statusMeta = STALL_STATUS_META[stall.status];

  // Top 3 products by revenue
  const productRevenue: Record<string, { name: string; total: number; qty: number }> = {};
  transactions.filter((t) => t.stallId === stall.id).forEach((t) =>
    t.items.forEach((item) => {
      if (!productRevenue[item.productName]) {
        productRevenue[item.productName] = { name: item.productName, total: 0, qty: 0 };
      }
      productRevenue[item.productName].total += item.price * item.quantity;
      productRevenue[item.productName].qty   += item.quantity;
    })
  );
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Recent 4 orders
  const recentOrders = [...orders]
    .filter((o) => o.stallId === stall.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const ORDER_STATUS_STYLE: Record<string, string> = {
    NEW:            "bg-blue-100 text-blue-700",
    CONFIRMED:      "bg-indigo-100 text-indigo-700",
    PREPARING:      "bg-amber-100 text-amber-700",
    READY:          "bg-emerald-100 text-emerald-700",
    SERVED:         "bg-teal-100 text-teal-700",
    BILL_REQUESTED: "bg-purple-100 text-purple-700",
    PAID:           "bg-slate-100 text-slate-500",
    CANCELLED:      "bg-red-100 text-red-500",
  };
  const ORDER_STATUS_LABEL: Record<string, string> = {
    NEW: "Yangi", CONFIRMED: "Tasdiqlandi", PREPARING: "Tayyorlanmoqda",
    READY: "Tayyor", SERVED: "Yetkazildi", BILL_REQUESTED: "Hisob",
    PAID: "To'landi", CANCELLED: "Bekor",
  };

  return (
    <div className="space-y-5">
      {/* ── Stall identity card ── */}
      <div className="card overflow-hidden">
        {/* Accent gradient top */}
        <div className={`h-2 w-full ${
          stall.type === "FASTFOOD"   ? "bg-gradient-to-r from-orange-500 to-amber-400"
          : stall.type === "TEAHOUSE" ? "bg-gradient-to-r from-emerald-600 to-teal-400"
          : stall.type === "CAFE"     ? "bg-gradient-to-r from-amber-600 to-yellow-400"
          : stall.type === "STALL"    ? "bg-gradient-to-r from-purple-600 to-violet-400"
          : stall.type === "ATTRACTION" ? "bg-gradient-to-r from-blue-600 to-cyan-400"
          : "bg-gradient-to-r from-slate-400 to-gray-300"
        }`} />
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 ${typeMeta.bg}`}>
            {typeMeta.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-[800] text-[#1e3d1f]">{stall.name}</h2>
              <span className={`badge border text-[10px] ${typeMeta.bg} ${typeMeta.color}`}>{typeMeta.label}</span>
              <span className={`badge ${statusMeta.badge}`}>{statusMeta.label}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#637063]">
              {stall.floor       && <span>📍 {stall.floor}</span>}
              {stall.openTime    && <span>🕘 {stall.openTime} — {stall.closeTime}</span>}
              {stall.tableCount  && <span>🪑 {stall.tableCount} ta stol</span>}
              {stall.description && <span className="text-[#9daa9e] italic">{stall.description}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI metric cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Bugungi tushum",
            value: `${formatNumber(Math.round(metrics.revenue / 1000))}k`,
            unit: "so'm",
            icon: <DollarSign className="w-4 h-4" />,
            cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100",
          },
          {
            label: "Tranzaksiyalar",
            value: metrics.orderCount,
            unit: "ta",
            icon: <ShoppingBag className="w-4 h-4" />,
            cls: "text-blue-600", bg: "bg-blue-50 border-blue-100",
          },
          {
            label: "Faol buyurtma",
            value: metrics.activeOrders,
            unit: "ta",
            icon: <Clock className="w-4 h-4" />,
            cls: metrics.activeOrders > 0 ? "text-amber-600" : "text-slate-400",
            bg: metrics.activeOrders > 0 ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100",
          },
          {
            label: "Kam zaxira",
            value: metrics.lowStockCount,
            unit: "ta",
            icon: <AlertTriangle className="w-4 h-4" />,
            cls: metrics.lowStockCount > 0 ? "text-red-600" : "text-slate-400",
            bg: metrics.lowStockCount > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100",
          },
          {
            label: "Band stollar",
            value: `${metrics.tablesOccupied}/${metrics.tablesTotal}`,
            unit: "",
            icon: <LayoutGrid className="w-4 h-4" />,
            cls: "text-violet-600", bg: "bg-violet-50 border-violet-100",
            hide: metrics.tablesTotal === 0,
          },
          {
            label: "Xodimlar",
            value: metrics.staffOnDuty,
            unit: "ta",
            icon: <Users className="w-4 h-4" />,
            cls: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100",
          },
        ]
          .filter((c) => !c.hide)
          .map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center ${c.bg}`}
            >
              <div className={`mb-1.5 ${c.cls}`}>{c.icon}</div>
              <p className={`text-lg font-[800] leading-none font-mono ${c.cls}`}>
                {c.value}
                {c.unit && <span className="text-[10px] font-[600] ml-0.5">{c.unit}</span>}
              </p>
              <p className="text-[10px] font-[600] text-[#9daa9e] mt-1 leading-tight">{c.label}</p>
            </motion.div>
          ))}
      </div>

      {/* ── Top products + recent orders row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top products */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#4d8751]" />
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Top mahsulotlar</h4>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-[#9daa9e] text-sm py-4 text-center">Hali sotuv yo'q</p>
          ) : (
            topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[800] shrink-0
                  ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : "bg-[#d8edda] text-[#1e3d1f]"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-[700] text-[#1e3d1f] truncate">{p.name}</p>
                  <p className="text-[10px] text-[#9daa9e]">{p.qty} ta sotildi</p>
                </div>
                <span className="text-xs font-[800] text-[#1e3d1f] font-mono shrink-0">
                  {formatNumber(p.total)} so'm
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent orders */}
        <div className="card p-5 space-y-3">
          <h4 className="text-sm font-[800] text-[#1e3d1f] mb-1">Oxirgi buyurtmalar</h4>
          {recentOrders.length === 0 ? (
            <p className="text-[#9daa9e] text-sm py-4 text-center">Hali buyurtma yo'q</p>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <span className="text-base shrink-0">
                  {o.type === "DINE_IN" ? "🪑" : o.type === "FASTFOOD" ? "🍔" : "🥡"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-[700] text-[#1e3d1f]">
                    {o.tableNumber ? `Stol #${o.tableNumber}` : o.type}
                    {o.waiterName && <span className="text-[#9daa9e] font-[500] ml-1">· {o.waiterName}</span>}
                  </p>
                  <p className="text-[10px] text-[#637063] font-mono">{o.createdAt}</p>
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  <span className={`badge text-[10px] border ${ORDER_STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </span>
                  <p className="text-xs font-[800] text-[#1e3d1f] font-mono">
                    {formatNumber(o.totalAmount)} so'm
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

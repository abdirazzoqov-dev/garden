"use client";

import { DollarSign, ShoppingCart, AlertTriangle, Activity } from "lucide-react";
import { formatNumber } from "../utils";

interface MetricCardsProps {
  totalRevenue: number;
  totalProductsSold: number;
  criticalStockCount: number;
  syncQueueLength: number;
}

export default function MetricCards({
  totalRevenue,
  totalProductsSold,
  criticalStockCount,
  syncQueueLength,
}: MetricCardsProps) {
  const cards = [
    {
      label: "Bugungi jami tushum",
      value: `${formatNumber(totalRevenue)} so'm`,
      sub: "Sinxronlangan asosiy baza bo'yicha",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Sotilgan tovarlar",
      value: `${totalProductsSold} dona`,
      sub: "Stallar kesimida sotuv miqdori",
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Zaxira tahlili (Alerts)",
      value: `${criticalStockCount} ta tovar kam`,
      sub: "Yetkazib berish talab etiladi",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: criticalStockCount > 0 ? "text-amber-400" : "text-emerald-400",
      bg: criticalStockCount > 0
        ? "bg-amber-500/10 border-amber-500/20"
        : "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Navbatdagi sinxronizatsiya",
      value: `${syncQueueLength} paket`,
      sub: "IndexedDB kompyuterda kutilmoqda",
      icon: <Activity className="h-5 w-5" />,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-tight">
              {c.label}
            </span>
            <h3 className={`text-xl font-bold mt-1.5 font-mono truncate ${c.color}`}>
              {c.value}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{c.sub}</p>
          </div>
          <div className={`p-3 rounded-xl border shrink-0 ${c.color} ${c.bg}`}>
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

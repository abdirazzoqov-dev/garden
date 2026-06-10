"use client";

import { TrendingUp, ShoppingBag, AlertTriangle, CloudOff } from "lucide-react";
import { formatNumber } from "../utils";

interface MetricCardsProps {
  totalRevenue: number;
  totalProductsSold: number;
  criticalStockCount: number;
  syncQueueLength: number;
}

interface CardDef {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;      // tailwind color classes for icon bg + text
  glow: string;        // subtle top border color
}

export default function MetricCards({
  totalRevenue,
  totalProductsSold,
  criticalStockCount,
  syncQueueLength,
}: MetricCardsProps) {
  const cards: CardDef[] = [
    {
      label: "Bugungi tushum",
      value: `${formatNumber(totalRevenue)} so'm`,
      sub: "Barcha rastalar bo'yicha",
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "bg-emerald-500/15 text-emerald-400",
      glow: "from-emerald-500/40 to-transparent",
    },
    {
      label: "Sotilgan mahsulotlar",
      value: `${totalProductsSold} dona`,
      sub: "Bugungi sotuv hajmi",
      icon: <ShoppingBag className="w-5 h-5" />,
      accent: "bg-blue-500/15 text-blue-400",
      glow: "from-blue-500/40 to-transparent",
    },
    {
      label: "Kam zaxira",
      value: `${criticalStockCount} ta mahsulot`,
      sub: "Zudlik bilan to'ldirish kerak",
      icon: <AlertTriangle className="w-5 h-5" />,
      accent: criticalStockCount > 0 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400",
      glow: criticalStockCount > 0 ? "from-amber-500/40 to-transparent" : "from-emerald-500/40 to-transparent",
    },
    {
      label: "Sync navbati",
      value: `${syncQueueLength} paket`,
      sub: "IndexedDB'da kutilmoqda",
      icon: <CloudOff className="w-5 h-5" />,
      accent: syncQueueLength > 0 ? "bg-violet-500/15 text-violet-400" : "bg-slate-500/15 text-slate-400",
      glow: syncQueueLength > 0 ? "from-violet-500/40 to-transparent" : "from-slate-500/20 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="metric-card group">
          {/* Top gradient line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.glow} rounded-t-[var(--radius-card)]`} />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-[700] uppercase tracking-[.08em] text-slate-400 mb-2">
                {c.label}
              </p>
              <p className="text-[1.35rem] font-[800] text-white leading-none tracking-tight font-mono truncate">
                {c.value}
              </p>
              <p className="text-[11px] text-slate-500 font-[500] mt-1.5">{c.sub}</p>
            </div>
            <div className={`shrink-0 p-2.5 rounded-xl ${c.accent}`}>
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

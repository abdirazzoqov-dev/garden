"use client";

import { LayoutDashboard, ChevronRight } from "lucide-react";
import type { Stall, StallMetrics } from "../types";
import { STALL_TYPE_META, STALL_STATUS_META } from "../constants";
import { formatNumber } from "../utils";

interface StallSelectorProps {
  stalls:         Stall[];
  metricsMap:     Record<string, StallMetrics>;
  selectedStallId: string | null;   // null = admin overview
  onSelect:        (id: string | null) => void;
}

export default function StallSelector({
  stalls, metricsMap, selectedStallId, onSelect,
}: StallSelectorProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-2">

      {/* Admin dashboard link */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
          ${selectedStallId === null
            ? "bg-[#1e3d1f] border-[#1e3d1f] text-white shadow-md"
            : "bg-white border-[#dedad3] text-[#637063] hover:border-[#4d8751] hover:text-[#1e3d1f]"
          }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${selectedStallId === null ? "bg-white/10" : "bg-[#f0ede8]"}`}>
          <LayoutDashboard className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-[800] truncate">Admin Panel</p>
          <p className={`text-[10px] font-[500] ${selectedStallId === null ? "text-white/70" : "text-[#9daa9e]"}`}>
            Barcha rastalar monitoring
          </p>
        </div>
        {selectedStallId === null && (
          <ChevronRight className="w-4 h-4 shrink-0 text-white/60" />
        )}
      </button>

      {/* Divider */}
      <div className="border-t border-[#dedad3] my-2" />

      {/* Stall buttons */}
      {stalls.map((stall) => {
        const isSelected = selectedStallId === stall.id;
        const meta       = STALL_TYPE_META[stall.type];
        const statusMeta = STALL_STATUS_META[stall.status];
        const m          = metricsMap[stall.id];

        // Accent color by type
        const accentActive =
          stall.type === "FASTFOOD"   ? "bg-orange-600 border-orange-600"
          : stall.type === "TEAHOUSE" ? "bg-emerald-700 border-emerald-700"
          : stall.type === "CAFE"     ? "bg-amber-600 border-amber-600"
          : stall.type === "ATTRACTION" ? "bg-blue-700 border-blue-700"
          : "bg-purple-700 border-purple-700";

        return (
          <button
            key={stall.id}
            onClick={() => onSelect(stall.id)}
            disabled={stall.status !== "ACTIVE"}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
              disabled:opacity-50 disabled:cursor-not-allowed group
              ${isSelected
                ? `${accentActive} text-white shadow-md`
                : "bg-white border-[#dedad3] text-[#637063] hover:border-[#4d8751] hover:text-[#1e3d1f]"
              }`}
          >
            {/* Emoji icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0
              ${isSelected ? "bg-white/15" : meta.bg}`}>
              {meta.emoji}
            </div>

            {/* Name + type */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-[800] leading-tight truncate">
                {stall.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-[10px] font-[600] ${isSelected ? "text-white/75" : meta.color}`}>
                  {meta.label}
                </span>
                {stall.status !== "ACTIVE" && (
                  <span className={`badge text-[9px] ${statusMeta.badge}`}>
                    {statusMeta.label}
                  </span>
                )}
              </div>
            </div>

            {/* Mini metrics */}
            {m && isSelected && (
              <div className="shrink-0 text-right space-y-0.5">
                <p className="text-[10px] font-[800] font-mono text-white/90">
                  {formatNumber(Math.round(m.revenue / 1000))}k
                </p>
                {m.activeOrders > 0 && (
                  <p className="text-[9px] text-white/70 font-[700]">
                    {m.activeOrders} buyurtma
                  </p>
                )}
              </div>
            )}
            {!isSelected && (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#c4ccc4] group-hover:text-[#4d8751] transition-colors" />
            )}
          </button>
        );
      })}
    </aside>
  );
}

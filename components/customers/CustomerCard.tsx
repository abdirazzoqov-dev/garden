"use client";

import { Phone, Mail, Calendar, Star, TrendingUp, Gift, Pencil, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import type { Customer, LoyaltyTransaction } from "../types";
import { LOYALTY_TIERS } from "../constants";
import { formatNumber } from "../utils";

interface CustomerCardProps {
  customer: Customer;
  loyaltyHistory: LoyaltyTransaction[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onAddPoints: (points: number, desc: string) => void;
  onRedeemPoints: (points: number) => void;
}

const POINTS_PER_REDEEM = 500; // 500 points = 50 000 so'm discount
const REDEEM_VALUE       = 50000;

export default function CustomerCard({
  customer, loyaltyHistory, isExpanded,
  onToggleExpand, onEdit, onDelete, onToggleActive,
  onAddPoints, onRedeemPoints,
}: CustomerCardProps) {
  const tierMeta = LOYALTY_TIERS[customer.tier];
  const history  = loyaltyHistory.filter((t) => t.customerId === customer.id).slice(0, 5);

  // Progress to next tier
  const tierKeys = ["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const;
  const tierIdx  = tierKeys.indexOf(customer.tier);
  const nextTier = tierIdx < 3 ? LOYALTY_TIERS[tierKeys[tierIdx + 1]] : null;
  const progress = nextTier
    ? Math.min(100, Math.round(((customer.totalSpent - tierMeta.minSpent) / (nextTier.minSpent - tierMeta.minSpent)) * 100))
    : 100;

  // Days since last visit
  const daysSince = customer.lastVisit
    ? Math.floor((Date.now() - new Date(customer.lastVisit).getTime()) / 86400000)
    : null;

  const isBirthdaySoon = customer.birthday
    ? (() => {
        const today = new Date();
        const bday  = new Date(customer.birthday);
        bday.setFullYear(today.getFullYear());
        const diff  = Math.ceil((bday.getTime() - today.getTime()) / 86400000);
        return diff >= 0 && diff <= 7;
      })()
    : false;

  return (
    <div className={`card overflow-hidden transition-all ${!customer.isActive ? "opacity-60" : ""}`}>
      {/* Top tier bar */}
      <div className={`h-1.5 w-full ${
        customer.tier === "PLATINUM" ? "bg-gradient-to-r from-purple-500 to-pink-500"
        : customer.tier === "GOLD"   ? "bg-gradient-to-r from-yellow-400 to-amber-500"
        : customer.tier === "SILVER" ? "bg-gradient-to-r from-slate-400 to-slate-300"
        : "bg-gradient-to-r from-amber-700 to-amber-500"
      }`} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-[800] shrink-0
              ${customer.tier === "PLATINUM" ? "bg-purple-100 text-purple-700"
              : customer.tier === "GOLD"   ? "bg-yellow-100 text-yellow-700"
              : customer.tier === "SILVER" ? "bg-slate-100 text-slate-600"
              : "bg-amber-100 text-amber-700"
              }`}>
              {customer.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-[800] text-[#1e3d1f] truncate">{customer.name}</p>
                <span className={`badge border text-[10px] ${tierMeta.bg} ${tierMeta.color}`}>
                  {tierMeta.emoji} {tierMeta.label}
                </span>
                {isBirthdaySoon && <span className="text-xs">🎂</span>}
                {!customer.isActive && <span className="badge badge-slate text-[10px]">Nofaol</span>}
              </div>
              <p className="text-[11px] text-[#637063] font-mono">{customer.phone}</p>
            </div>
          </div>

          {/* Points bubble */}
          <div className="shrink-0 text-right">
            <p className={`text-lg font-[800] font-mono ${tierMeta.color}`}>{customer.points}</p>
            <p className="text-[9px] text-[#9daa9e] font-[600]">ball</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Jami xarid",   value: `${formatNumber(Math.round(customer.totalSpent / 1000))}k`,  icon: <TrendingUp className="w-3 h-3" /> },
            { label: "Tashrif",      value: `${customer.visitCount} ta`,                                icon: <Star       className="w-3 h-3" /> },
            { label: "Oxirgi tashrif", value: daysSince !== null ? `${daysSince} kun` : "—",           icon: <Calendar   className="w-3 h-3" /> },
          ].map((s) => (
            <div key={s.label} className="bg-[#f7f5f2] rounded-xl p-2 border border-[#f0ede8]">
              <div className="flex items-center justify-center gap-1 text-[#637063] mb-0.5">{s.icon}</div>
              <p className="text-xs font-[800] text-[#1e3d1f]">{s.value}</p>
              <p className="text-[9px] text-[#9daa9e]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Next tier progress */}
        {nextTier && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#637063] font-[600]">
                Keyingi daraja: {nextTier.emoji} {nextTier.label}
              </span>
              <span className="font-[700] text-[#1e3d1f]">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#f0ede8] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  customer.tier === "BRONZE" ? "bg-amber-700" : customer.tier === "SILVER" ? "bg-slate-400" : "bg-yellow-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[9px] text-[#9daa9e]">
              {formatNumber(nextTier.minSpent - customer.totalSpent)} so'm qoldi
            </p>
          </div>
        )}
        {!nextTier && (
          <div className="text-center py-1">
            <span className="text-xs text-purple-600 font-[700]">💎 Platinum — eng yuqori daraja!</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#f0ede8]">
          <button onClick={onToggleExpand}
            className={`btn btn-sm flex-1 ${isExpanded ? "btn-secondary" : "btn-primary"}`}>
            <Gift className="w-3.5 h-3.5" />
            {isExpanded ? "Yopish" : "Balllar"}
          </button>
          <button onClick={onToggleActive} title={customer.isActive ? "Nofaol qilish" : "Faol qilish"}>
            {customer.isActive
              ? <ToggleRight className="w-6 h-6 text-emerald-500" />
              : <ToggleLeft  className="w-6 h-6 text-[#c4ccc4]" />
            }
          </button>
          <button onClick={onEdit}   className="btn-icon btn-icon-sm"><Pencil className="w-3 h-3" /></button>
          <button onClick={onDelete} className="btn-icon btn-icon-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Expanded: points management + history */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-[#f0ede8]">
            {/* Redeem */}
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 space-y-2">
              <p className="text-xs font-[800] text-violet-800">Ball almashish</p>
              <p className="text-[11px] text-violet-600">
                {POINTS_PER_REDEEM} ball = {formatNumber(REDEEM_VALUE)} so'm chegirma
              </p>
              <button
                onClick={() => onRedeemPoints(POINTS_PER_REDEEM)}
                disabled={customer.points < POINTS_PER_REDEEM}
                className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Gift className="w-3.5 h-3.5" />
                {POINTS_PER_REDEEM} ball almashish
              </button>
            </div>

            {/* Bonus */}
            <div className="flex gap-2">
              <button onClick={() => onAddPoints(100, "Qo'lda ball qo'shish")}
                className="btn btn-secondary btn-sm flex-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                +100 ball
              </button>
              <button onClick={() => onAddPoints(200, "Tug'ilgan kun bonusi 🎂")}
                className="btn btn-secondary btn-sm flex-1 text-amber-700 border-amber-200 hover:bg-amber-50">
                +200 🎂
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-[700] text-[#637063] uppercase tracking-wide">Oxirgi amallar</p>
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#637063] truncate">{h.description}</span>
                    <span className={`font-[800] font-mono shrink-0 ml-2 ${h.points > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {h.points > 0 ? "+" : ""}{h.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

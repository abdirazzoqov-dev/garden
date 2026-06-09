"use client";

import { motion } from "motion/react";
import type { Transaction } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";
import { formatNumber } from "../utils";

interface StallAnalyticsProps {
  stallId:      string;
  transactions: Transaction[];
}

export default function StallAnalytics({ stallId, transactions }: StallAnalyticsProps) {
  const stallTxns = transactions.filter((t) => t.stallId === stallId);

  // Revenue by payment method
  const payBreakdown = {
    CASH:   stallTxns.filter((t) => t.paymentMethod === "CASH").reduce((s, t) => s + t.amount, 0),
    CARD:   stallTxns.filter((t) => t.paymentMethod === "CARD").reduce((s, t) => s + t.amount, 0),
    MOBILE: stallTxns.filter((t) => t.paymentMethod === "MOBILE").reduce((s, t) => s + t.amount, 0),
  };
  const total = Object.values(payBreakdown).reduce((s, v) => s + v, 0);

  // Top products
  const prodMap: Record<string, { name: string; total: number; qty: number }> = {};
  stallTxns.forEach((t) =>
    t.items.forEach((item) => {
      if (!prodMap[item.productName]) prodMap[item.productName] = { name: item.productName, total: 0, qty: 0 };
      prodMap[item.productName].total += item.price * item.quantity;
      prodMap[item.productName].qty   += item.quantity;
    })
  );
  const topProds = Object.values(prodMap).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxProd  = topProds[0]?.total ?? 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Payment methods */}
      <div className="card p-5 space-y-4">
        <h4 className="text-sm font-[800] text-[#1e3d1f]">To'lov usullari</h4>
        {total === 0 ? (
          <p className="text-[#9daa9e] text-sm py-4 text-center">Ma'lumot yo'q</p>
        ) : (
          <div className="space-y-3">
            {[
              { key: "CASH",   label: "💵 Naqd",       cls: "bg-emerald-500" },
              { key: "CARD",   label: "💳 Terminal",    cls: "bg-blue-500"    },
              { key: "MOBILE", label: "📱 Click/Payme", cls: "bg-violet-500"  },
            ].map(({ key, label, cls }) => {
              const amount = payBreakdown[key as keyof typeof payBreakdown];
              const pct    = total > 0 ? Math.round((amount / total) * 100) : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-[700]">
                    <span className="text-[#637063]">{label}</span>
                    <span className="text-[#1e3d1f] font-mono">{pct}% · {formatNumber(amount)} so'm</span>
                  </div>
                  <div className="h-2 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${cls}`}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-[#f0ede8] flex justify-between text-sm font-[800]">
              <span className="text-[#637063]">Jami</span>
              <span className="text-[#1e3d1f] font-mono">{formatNumber(total)} so'm</span>
            </div>
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="card p-5 space-y-3">
        <h4 className="text-sm font-[800] text-[#1e3d1f]">Eng ko'p sotilgan</h4>
        {topProds.length === 0 ? (
          <p className="text-[#9daa9e] text-sm py-4 text-center">Ma'lumot yo'q</p>
        ) : (
          topProds.map((p, i) => {
            const pct = (p.total / maxProd) * 100;
            return (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-[800] shrink-0
                      ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-600" : "bg-[#f0ede8] text-[#637063]"}`}>
                      {i + 1}
                    </span>
                    <span className="font-[700] text-[#1e3d1f] truncate max-w-[140px]">{p.name}</span>
                  </div>
                  <span className="font-[800] font-mono text-[#1e3d1f] shrink-0">×{p.qty}</span>
                </div>
                <div className="h-1.5 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#1e3d1f] to-[#4d8751]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import { formatNumber } from "../utils";
import type { Stall, Transaction } from "../types";

interface RevenueChartProps {
  stalls: Stall[];
  transactions: Transaction[];
}

const STALL_COLORS = [
  { bar: "from-[#4d8751] to-[#91c494]", label: "text-emerald-400" },
  { bar: "from-blue-700 to-blue-400",   label: "text-blue-400"    },
  { bar: "from-violet-700 to-violet-400", label: "text-violet-400" },
  { bar: "from-amber-600 to-amber-300",   label: "text-amber-400"  },
];

export default function RevenueChart({ stalls, transactions }: RevenueChartProps) {
  const data = stalls.map((s, i) => ({
    ...s,
    amount: transactions.filter((t) => t.stallId === s.id).reduce((sum, t) => sum + t.amount, 0),
    color: STALL_COLORS[i % STALL_COLORS.length],
  }));

  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const total  = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="card p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-[700] text-[#1e3d1f]">Rastalar bo'yicha tushum</h4>
          <p className="text-[11px] text-[#637063] mt-0.5">Bugungi savdo dinamikasi</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-[700] text-[#9daa9e] uppercase tracking-wider">Jami</p>
          <p className="text-base font-[800] text-[#1e3d1f] font-mono">{formatNumber(total)} so'm</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-3 h-44">
        {data.map((d, i) => {
          const pct = (d.amount / maxVal) * 100;
          const shortName = d.name.split(" ")[0];
          return (
            <div key={d.id} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Amount label (hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <p className="text-[10px] font-[700] font-mono text-[#1e3d1f] text-center whitespace-nowrap">
                  {formatNumber(d.amount)}
                </p>
              </div>

              {/* Bar wrapper — fixed height container */}
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  className={`w-full rounded-xl bg-gradient-to-t ${d.color.bar} shadow-sm`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, d.amount > 0 ? 4 : 0)}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="text-[10px] font-[700] text-[#283028] leading-tight">{shortName}</p>
                <p className={`text-[9px] font-[700] font-mono ${d.color.label}`}>
                  {formatNumber(Math.round(d.amount / 1000))}k
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share bars */}
      <div className="space-y-2">
        {data.map((d, i) => {
          const share = total > 0 ? (d.amount / total) * 100 : 0;
          return (
            <div key={d.id} className="flex items-center gap-3">
              <p className="text-[11px] font-[600] text-[#637063] truncate w-36 shrink-0">
                {d.name.replace("Restorani", "").replace("Ko'ngilochar", "").trim()}
              </p>
              <div className="flex-1 h-1.5 bg-[#f0ede8] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${d.color.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${share}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
                />
              </div>
              <p className="text-[11px] font-[700] text-[#1e3d1f] font-mono w-10 text-right shrink-0">
                {share.toFixed(0)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

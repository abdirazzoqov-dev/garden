"use client";

import { motion } from "motion/react";
import { formatNumber } from "../utils";
import type { Stall, Transaction } from "../types";

interface RevenueChartProps {
  stalls: Stall[];
  transactions: Transaction[];
}

export default function RevenueChart({ stalls, transactions }: RevenueChartProps) {
  const stallAmounts = stalls.map((s) => ({
    ...s,
    amount: transactions
      .filter((t) => t.stallId === s.id)
      .reduce((sum, t) => sum + t.amount, 0),
  }));

  const maxVal = Math.max(...stallAmounts.map((s) => s.amount), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">
            Rastalar bo'yicha tushum dinamikasi
          </h4>
          <p className="text-[10px] text-[#588157] mt-0.5">
            Har bir savdo burchagi tushumi (so'm)
          </p>
        </div>
        <span className="text-[10px] font-mono bg-[#A3B18A]/20 text-[#2D452E] px-2.5 py-1 rounded-full border border-[#DAD7CD] font-bold">
          Jonli hisobot
        </span>
      </div>

      <div className="flex gap-4 items-end justify-around h-52 px-2">
        {stallAmounts.map((s) => {
          const pct = (s.amount / maxVal) * 85;
          const shortName = s.name.split(" ")[0];
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center group">
              <div className="w-full relative flex flex-col justify-end" style={{ height: 160 }}>
                {/* Hover tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2D452E] text-[9px] font-mono px-2 py-1 rounded-lg text-[#E9EDC9] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md pointer-events-none font-bold">
                  {formatNumber(s.amount)} so'm
                </div>
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                  className="w-full rounded-t-xl bg-gradient-to-t from-[#2D452E]/90 to-[#588157] group-hover:from-[#2D452E] group-hover:to-[#3A5A40] transition-colors border-t border-[#DAD7CD]/30"
                />
              </div>
              <p className="text-[10px] text-[#2D3A2D] font-bold mt-2 text-center leading-tight">
                {shortName}
              </p>
              <p className="text-[9px] text-[#588157] font-mono font-semibold mt-0.5">
                {Math.round(s.amount / 1000)}k so'm
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

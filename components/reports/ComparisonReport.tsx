"use client";

import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Transaction, Stall } from "../types";
import { formatNumber } from "../utils";

interface ComparisonReportProps {
  transactions: Transaction[];
  stalls:       Stall[];
}

type Period = "week" | "month";

// Simulated "previous period" multiplier (demo data)
function prevMultiplier() { return 0.75 + Math.random() * 0.5; }

function TrendBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 1) return <span className="badge badge-slate text-[10px]">— Teng</span>;
  if (pct > 0) return (
    <span className="badge text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-0.5">
      <TrendingUp className="w-3 h-3" /> +{pct.toFixed(0)}%
    </span>
  );
  return (
    <span className="badge text-[10px] bg-red-100 text-red-700 border-red-200 flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" /> {pct.toFixed(0)}%
    </span>
  );
}

export default function ComparisonReport({ transactions, stalls }: ComparisonReportProps) {
  // Current period stats (actual)
  const currentRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const currentOrders  = transactions.length;
  const currentAvg     = currentOrders > 0 ? Math.round(currentRevenue / currentOrders) : 0;

  // Simulated previous period
  const prevRevenue = Math.round(currentRevenue * prevMultiplier());
  const prevOrders  = Math.round(currentOrders  * prevMultiplier());
  const prevAvg     = prevOrders > 0 ? Math.round(prevRevenue / prevOrders) : 0;

  const revenuePct = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const ordersPct  = prevOrders  > 0 ? ((currentOrders  - prevOrders)  / prevOrders)  * 100 : 0;
  const avgPct     = prevAvg     > 0 ? ((currentAvg     - prevAvg)     / prevAvg)     * 100 : 0;

  // Per-stall comparison
  const stallComp = stalls.map((s) => {
    const curr = transactions.filter((t) => t.stallId === s.id).reduce((a, t) => a + t.amount, 0);
    const prev = Math.round(curr * prevMultiplier());
    const pct  = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
    return { stall: s, curr, prev, pct };
  }).sort((a, b) => b.curr - a.curr);

  const maxCurr = Math.max(...stallComp.map((s) => s.curr), 1);
  const maxPrev = Math.max(...stallComp.map((s) => s.prev), 1);

  // Simulated daily revenue for 2 weeks (7 days each)
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const baseDaily = currentRevenue / 7 || 50000;
  const thisWeek  = days.map(() => Math.round(baseDaily * (0.6 + Math.random() * 0.9)));
  const lastWeek  = days.map(() => Math.round(baseDaily * (0.5 + Math.random() * 0.8)));
  const maxDaily  = Math.max(...thisWeek, ...lastWeek, 1);

  return (
    <div className="space-y-6">

      {/* ── Top comparison KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Jami tushum", curr: currentRevenue, prev: prevRevenue, pct: revenuePct, unit: "so'm", mono: true },
          { label: "Tranzaksiyalar", curr: currentOrders, prev: prevOrders, pct: ordersPct, unit: "ta"   },
          { label: "O'rtacha chek", curr: currentAvg,   prev: prevAvg,    pct: avgPct,    unit: "so'm", mono: true },
        ].map((c) => (
          <div key={c.label} className="card p-5 space-y-3">
            <p className="section-label">{c.label}</p>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] text-[#9daa9e] font-[600]">Bu davr</p>
                <p className={`text-xl font-[800] text-[#1e3d1f] leading-none ${c.mono ? "font-mono" : ""}`}>
                  {c.mono ? formatNumber(c.curr) : c.curr}
                  <span className="text-xs font-[600] text-[#637063] ml-1">{c.unit}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9daa9e] font-[600]">O'tgan davr</p>
                <p className={`text-sm font-[700] text-[#637063] ${c.mono ? "font-mono" : ""}`}>
                  {c.mono ? formatNumber(c.prev) : c.prev}
                  <span className="text-[10px] ml-1">{c.unit}</span>
                </p>
              </div>
            </div>
            <TrendBadge pct={c.pct} />
          </div>
        ))}
      </div>

      {/* ── Weekly bar chart comparison ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Haftalik solishtirma</h4>
            <p className="text-[11px] text-[#637063]">Bu hafta vs o'tgan hafta (so'm)</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-[700]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1e3d1f] shrink-0" />Bu hafta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#b8d9ba] shrink-0" />O'tgan hafta
            </span>
          </div>
        </div>

        <div className="flex items-end gap-2 h-48">
          {days.map((day, i) => {
            const currH = (thisWeek[i] / maxDaily) * 100;
            const prevH = (lastWeek[i] / maxDaily) * 100;
            const diff  = thisWeek[i] - lastWeek[i];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-center text-[#1e3d1f] font-[700]">
                  <div>{formatNumber(Math.round(thisWeek[i]/1000))}k</div>
                  <div className={diff >= 0 ? "text-emerald-600" : "text-red-500"}>
                    {diff >= 0 ? "+" : ""}{formatNumber(Math.round(diff/1000))}k
                  </div>
                </div>

                {/* Bars side by side */}
                <div className="w-full flex items-end gap-0.5 flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${currH}%` }}
                    transition={{ duration: 0.7, delay: i * 0.06, ease: [.22, 1, .36, 1] }}
                    className="flex-1 rounded-t-md bg-[#1e3d1f]"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${prevH}%` }}
                    transition={{ duration: 0.7, delay: i * 0.06 + 0.04, ease: [.22, 1, .36, 1] }}
                    className="flex-1 rounded-t-md bg-[#b8d9ba]"
                  />
                </div>
                <p className="text-[10px] font-[700] text-[#637063]">{day}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Per-stall comparison ── */}
      <div className="card p-5 space-y-4">
        <div>
          <h4 className="text-sm font-[800] text-[#1e3d1f]">Rastalar bo'yicha solishtirma</h4>
          <p className="text-[11px] text-[#637063]">Bu davr vs o'tgan davr</p>
        </div>
        <div className="space-y-4">
          {stallComp.map(({ stall: s, curr, prev, pct }, i) => {
            const currPct = (curr / maxCurr) * 100;
            const prevPct = (prev / maxPrev) * 100;
            return (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <p className="font-[700] text-[#1e3d1f]">
                    {s.type === "FASTFOOD" ? "🍔" : s.type === "TEAHOUSE" ? "🫖" : s.type === "CAFE" ? "☕" : s.type === "ATTRACTION" ? "🎢" : "🛍️"}{" "}
                    {s.name}
                  </p>
                  <TrendBadge pct={pct} />
                </div>
                {/* Bu davr bar */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#637063] w-20 shrink-0">Bu davr</span>
                    <div className="flex-1 h-2 bg-[#f0ede8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currPct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.07 }}
                        className="h-full rounded-full bg-[#1e3d1f]"
                      />
                    </div>
                    <span className="text-[10px] font-[800] font-mono text-[#1e3d1f] w-24 text-right shrink-0">
                      {formatNumber(curr)} so'm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#9daa9e] w-20 shrink-0">O'tgan davr</span>
                    <div className="flex-1 h-2 bg-[#f0ede8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prevPct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.07 + 0.06 }}
                        className="h-full rounded-full bg-[#b8d9ba]"
                      />
                    </div>
                    <span className="text-[10px] font-[600] font-mono text-[#9daa9e] w-24 text-right shrink-0">
                      {formatNumber(prev)} so'm
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

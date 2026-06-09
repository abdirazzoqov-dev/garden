"use client";

import { DollarSign, TrendingUp, Zap, Info } from "lucide-react";
import { formatNumber } from "../utils";
import type { Employee, PayrollResult } from "../types";

interface PayrollPanelProps {
  employees: Employee[];
  calculatePayroll: (emp: Employee) => PayrollResult;
}

export default function PayrollPanel({ employees, calculatePayroll }: PayrollPanelProps) {
  const grandTotal = employees.reduce((s, e) => s + calculatePayroll(e).totalWage, 0);

  return (
    <div className="card flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#f0ede8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#4d8751]" />
            <h4 className="text-sm font-[700] text-[#1e3d1f]">KPI & Oylik hisob</h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#9daa9e] font-[600]">Bugungi jami</p>
            <p className="text-sm font-[800] text-[#1e3d1f] font-mono">
              {formatNumber(grandTotal)} so'm
            </p>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="mx-5 mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#f7f5f2] border border-[#f0ede8]">
        <Info className="w-3.5 h-3.5 text-[#4d8751] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#637063] leading-relaxed">
          Hisob = <strong className="text-[#1e3d1f]">Kunlik stavka</strong> +{" "}
          <strong className="text-[#1e3d1f]">Sotuv × KPI%</strong>.
          To'liq Prisma schema «Blueprint» bo'limida.
        </p>
      </div>

      {/* Employee payroll rows */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {employees.map((emp) => {
          const { dailyBase, salesVolume, bonusAmount, totalWage } = calculatePayroll(emp);
          const bonusPct = totalWage > 0 ? (bonusAmount / totalWage) * 100 : 0;

          return (
            <div key={emp.id} className="rounded-2xl border border-[#f0ede8] overflow-hidden">
              {/* Top bar: name + total */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#f7f5f2]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#d8edda] text-[#1e3d1f] flex items-center justify-center text-xs font-[800]">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-[700] text-[#1e3d1f]">{emp.name}</p>
                    <p className="text-[10px] text-[#9daa9e] font-[500]">KPI {emp.bonusPercentage}%</p>
                  </div>
                </div>
                <p className="text-sm font-[800] text-[#1e3d1f] font-mono">
                  {formatNumber(totalWage)}{" "}
                  <span className="text-[10px] font-[600] text-[#637063]">so'm</span>
                </p>
              </div>

              {/* Detail rows */}
              <div className="px-4 py-3 space-y-2 bg-white">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#637063]">
                    <TrendingUp className="w-3 h-3" /> Kunlik stavka
                  </span>
                  <span className="font-[700] font-mono text-[#283028]">
                    {formatNumber(dailyBase)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#637063]">Bugungi sotuv</span>
                  <span className="font-[700] font-mono text-[#283028]">
                    {formatNumber(salesVolume)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#637063]">
                    <Zap className="w-3 h-3 text-amber-500" /> KPI bonus
                  </span>
                  <span className="font-[800] font-mono text-amber-700">
                    +{formatNumber(bonusAmount)} so'm
                  </span>
                </div>

                {/* Bonus share bar */}
                {totalWage > 0 && (
                  <div className="pt-1">
                    <div className="h-1.5 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-700"
                        style={{ width: `${bonusPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#9daa9e] mt-1">
                      Bonus ulushi: {bonusPct.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

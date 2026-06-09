"use client";

import { Calculator, HelpCircle } from "lucide-react";
import { formatNumber } from "../utils";
import type { Employee, PayrollResult } from "../types";

interface PayrollPanelProps {
  employees: Employee[];
  calculatePayroll: (emp: Employee) => PayrollResult;
}

export default function PayrollPanel({ employees, calculatePayroll }: PayrollPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F2F4EF] pb-3 mb-4">
        <h4 className="text-xs font-bold text-[#2D452E] uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="h-4 w-4 text-[#3A5A40]" />
          Kunbay KPI & Oylik hisobi
        </h4>
        <HelpCircle className="h-4 w-4 text-[#A3B18A]" />
      </div>

      <p className="text-xs text-[#588157] leading-relaxed mb-4">
        Tizim xodimlar hisob-kitobini{" "}
        <strong className="text-[#3A5A40]">ikki xil usulda</strong> hisoblaydi: fiksirlangan
        kunlik stavka va sotuv aylanmasidan foiz komissiyalari (KPI) yig'indisi.
      </p>

      {/* Employee payroll cards */}
      <div className="space-y-3 flex-1">
        {employees.map((emp) => {
          const { dailyBase, salesVolume, bonusAmount, totalWage } = calculatePayroll(emp);
          return (
            <div
              key={emp.id}
              className="bg-[#F2F4EF]/50 border border-[#DAD7CD] p-4 rounded-xl text-xs space-y-2"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#2D452E]">{emp.name}</span>
                <span className="text-[#3A5A40] font-black text-sm">
                  {formatNumber(totalWage)} so'm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-[#588157] font-mono text-[10px] font-semibold">
                <span>Fiksirlangan stavka (kun):</span>
                <span className="text-right text-[#2D3A2D] font-bold">
                  {formatNumber(dailyBase)} so'm
                </span>

                <span>Bugungi sotuv aylanmasi:</span>
                <span className="text-right text-[#2D3A2D] font-bold">
                  {formatNumber(salesVolume)} so'm
                </span>

                <span>KPI Bonus ({emp.bonusPercentage}%):</span>
                <span className="text-right text-[#3A5A40] font-black">
                  +{formatNumber(bonusAmount)} so'm
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-4 bg-[#2D452E]/10 border border-[#2D452E]/20 p-3 rounded-xl text-[11px] text-[#2D452E] leading-relaxed">
        💡 Sanoat standartidagi{" "}
        <strong className="text-[#3A5A40]">Prisma va SQL Payroll relatsiyalari</strong>,
        hisobotlarni hisoblash algoritmi «Arxitekturaviy Blueprint» bo'limida keltirilgan.
      </div>
    </div>
  );
}

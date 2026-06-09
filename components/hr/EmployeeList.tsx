"use client";

import { formatNumber } from "../utils";
import type { Employee, PayrollResult, PendingActionType } from "../types";

interface EmployeeListProps {
  employees: Employee[];
  calculatePayroll: (emp: Employee) => PayrollResult;
  onOpenAuth: (empId: string, action: PendingActionType) => void;
}

const ROLE_LABEL: Record<string, string> = {
  MANAGER:   "Menejer",
  SELLER:    "Sotuvchi",
  ATTENDANT: "Nazoratchi",
  ADMIN:     "Admin",
};

export default function EmployeeList({ employees, calculatePayroll, onOpenAuth }: EmployeeListProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F2F4EF]">
        <div>
          <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">
            Xodimlar Davomati va Boshqaruvi
          </h4>
          <p className="text-[10px] text-[#588157] mt-0.5">
            Kirish va chiqish vaqtlarini belgilash (Check-In / Out)
          </p>
        </div>
        <span className="text-[10px] bg-[#F2F4EF] text-[#2D452E] py-1 px-2.5 rounded-full font-mono font-bold border border-[#DAD7CD]">
          {employees.length} xodim
        </span>
      </div>

      <div className="space-y-3">
        {employees.map((emp) => {
          const { totalWage } = calculatePayroll(emp);
          return (
            <div
              key={emp.id}
              className="bg-[#F2F4EF]/50 p-4 rounded-xl border border-[#DAD7CD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Status dot */}
                <div className="pt-1 shrink-0">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      emp.isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  {/* Name + role */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#2D452E]">{emp.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A3B18A]/20 text-[#2D452E] border border-[#DAD7CD] font-bold">
                      {ROLE_LABEL[emp.role] ?? emp.role}
                    </span>
                  </div>

                  {/* Attendance + KPI */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-[#588157] mt-1">
                    {emp.isCheckedIn ? (
                      <span className="text-emerald-700 font-bold font-mono">
                        Check-in: {emp.lastCheckIn ?? "—"}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-mono font-bold">Nofaol rejimda</span>
                    )}
                    <span>·</span>
                    <span>
                      KPI Bonus:{" "}
                      <strong className="text-[#3A5A40] font-mono">{emp.bonusPercentage}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Bugungi hisob:{" "}
                      <strong className="text-[#2D452E]">{formatNumber(totalWage)} so'm</strong>
                    </span>
                  </div>

                  {/* Credentials */}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    <span className="text-[#588157]">🔑 Login:</span>
                    <code className="bg-[#A3B18A]/20 font-bold px-1.5 py-0.5 rounded text-[#2D452E] font-mono">
                      {emp.username}
                    </code>
                    <span className="text-[#588157]">Parol:</span>
                    <code className="bg-[#A3B18A]/20 font-bold px-1.5 py-0.5 rounded text-[#2D452E] font-mono">
                      {emp.password}
                    </code>
                  </div>
                </div>
              </div>

              {/* Check-in/out button */}
              <button
                onClick={() => onOpenAuth(emp.id, "check_toggle")}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  emp.isCheckedIn
                    ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
                    : "bg-[#2D452E] hover:bg-[#3A5A40] text-white"
                }`}
              >
                {emp.isCheckedIn ? "Check-Out" : "Check-In"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

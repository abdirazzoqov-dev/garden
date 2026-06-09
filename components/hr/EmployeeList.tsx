"use client";

import { UserCheck, UserX, Zap } from "lucide-react";
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

const ROLE_STYLE: Record<string, string> = {
  MANAGER:   "bg-violet-50 text-violet-700 border-violet-100",
  SELLER:    "bg-blue-50 text-blue-700 border-blue-100",
  ATTENDANT: "bg-amber-50 text-amber-700 border-amber-100",
  ADMIN:     "bg-rose-50 text-rose-700 border-rose-100",
};

export default function EmployeeList({ employees, calculatePayroll, onOpenAuth }: EmployeeListProps) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8]">
        <div>
          <h4 className="text-sm font-[700] text-[#1e3d1f]">Xodimlar boshqaruvi</h4>
          <p className="text-[11px] text-[#637063] mt-0.5">Check-In / Check-Out nazorati</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">
            {employees.filter((e) => e.isCheckedIn).length} faol
          </span>
          <span className="badge badge-slate">
            {employees.length} jami
          </span>
        </div>
      </div>

      {/* Employee cards */}
      <div className="divide-y divide-[#f7f5f2]">
        {employees.map((emp) => {
          const { totalWage, salesVolume, bonusAmount } = calculatePayroll(emp);
          return (
            <div
              key={emp.id}
              className={`
                flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-4
                transition-colors hover:bg-[#f7f5f2]/60
                ${!emp.isCheckedIn ? "opacity-60" : ""}
              `}
            >
              {/* Avatar + status dot */}
              <div className="relative shrink-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-[800]
                  ${emp.isCheckedIn
                    ? "bg-[#d8edda] text-[#1e3d1f]"
                    : "bg-[#f0ede8] text-[#9daa9e]"
                  }
                `}>
                  {emp.name.charAt(0)}
                </div>
                <span className={`
                  absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                  ${emp.isCheckedIn ? "bg-emerald-500" : "bg-slate-300"}
                `} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-[700] text-[#1e3d1f]">{emp.name}</p>
                  <span className={`badge border ${ROLE_STYLE[emp.role] ?? "bg-slate-50 text-slate-600 border-slate-100"}`}>
                    {ROLE_LABEL[emp.role] ?? emp.role}
                  </span>
                  {emp.isCheckedIn ? (
                    <span className="text-[10px] font-mono text-emerald-600 font-[700]">
                      ↑ {emp.lastCheckIn}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#9daa9e] font-[600]">Nofaol</span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                  <span className="text-[#637063]">
                    KPI: <strong className="text-[#1e3d1f]">{emp.bonusPercentage}%</strong>
                  </span>
                  <span className="text-[#637063]">
                    Sotuv: <strong className="text-[#1e3d1f] font-mono">{formatNumber(salesVolume)} so'm</strong>
                  </span>
                  <span className="flex items-center gap-1 text-[#637063]">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Bonus: <strong className="text-amber-700 font-mono">+{formatNumber(bonusAmount)} so'm</strong>
                  </span>
                </div>

                {/* Credentials */}
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-[#9daa9e]">Login:</span>
                  <code className="font-mono font-[700] bg-[#f0ede8] text-[#283028] px-1.5 py-0.5 rounded-md">
                    {emp.username}
                  </code>
                  <span className="text-[#9daa9e]">Parol:</span>
                  <code className="font-mono font-[700] bg-[#f0ede8] text-[#283028] px-1.5 py-0.5 rounded-md">
                    {emp.password}
                  </code>
                </div>
              </div>

              {/* Right side: wage + button */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-[#9daa9e] font-[600]">Bugungi hisob</p>
                  <p className="text-sm font-[800] text-[#1e3d1f] font-mono">
                    {formatNumber(totalWage)} <span className="text-[10px] font-[600] text-[#637063]">so'm</span>
                  </p>
                </div>

                <button
                  onClick={() => onOpenAuth(emp.id, "check_toggle")}
                  className={`
                    btn btn-sm flex items-center gap-1.5
                    ${emp.isCheckedIn
                      ? "btn-danger"
                      : "btn-primary"
                    }
                  `}
                >
                  {emp.isCheckedIn
                    ? <><UserX className="w-3.5 h-3.5" /> Check-Out</>
                    : <><UserCheck className="w-3.5 h-3.5" /> Check-In</>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

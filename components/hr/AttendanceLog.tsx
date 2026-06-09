"use client";

import type { AttendanceLog as AttendanceLogType } from "../types";

interface AttendanceLogProps {
  logs: AttendanceLogType[];
}

export default function AttendanceLog({ logs }: AttendanceLogProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm">
      <h4 className="text-xs uppercase tracking-wider font-bold text-[#2D452E] mb-4">
        Davomat jurnali (Attendance Log)
      </h4>

      <div className="max-h-[240px] overflow-y-auto pr-1">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-[#588157] border-b border-[#F2F4EF] text-[10px] uppercase font-bold">
              <th className="py-2.5 pr-3">Xodim ismi</th>
              <th className="py-2.5 pr-3">Lavozimi</th>
              <th className="py-2.5 pr-3">Amal Turi</th>
              <th className="py-2.5 text-right">Vaqt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F4EF]">
            {logs.map((log, i) => (
              <tr key={log.id ?? i} className="hover:bg-[#F2F4EF]/40 transition-colors">
                <td className="py-2.5 pr-3 font-sans font-bold text-[#2D452E]">
                  {log.employeeName}
                </td>
                <td className="py-2.5 pr-3 text-[#588157]">{log.role}</td>
                <td className="py-2.5 pr-3">
                  {log.type === "KIRISH" ? (
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200">
                      ↑ KIRISH
                    </span>
                  ) : (
                    <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-200">
                      ↓ CHIQISH
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-right text-[#588157]">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

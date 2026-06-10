"use client";

import { Clock } from "lucide-react";
import type { AttendanceLog as AttendanceLogType } from "../types";

interface AttendanceLogProps {
  logs: AttendanceLogType[];
}

export default function AttendanceLog({ logs }: AttendanceLogProps) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#4d8751]" />
          <h4 className="text-sm font-[700] text-[#1e3d1f]">Davomat jurnali</h4>
        </div>
        <span className="badge badge-slate font-mono">{logs.length} ta yozuv</span>
      </div>

      {/* Log table */}
      <div className="max-h-[260px] overflow-y-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Lavozim</th>
              <th>Harakat</th>
              <th className="text-right">Vaqt</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id ?? i}>
                {/* Name */}
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#d8edda] text-[#1e3d1f] flex items-center justify-center text-[10px] font-[800] shrink-0">
                      {log.employeeName.charAt(0)}
                    </div>
                    <span className="font-[700] text-[#1e3d1f] text-xs">{log.employeeName}</span>
                  </div>
                </td>

                {/* Role */}
                <td>
                  <span className="text-xs text-[#637063] font-[500]">{log.role}</span>
                </td>

                {/* Type */}
                <td>
                  {log.type === "KIRISH" ? (
                    <span className="badge badge-green">↑ Kirish</span>
                  ) : (
                    <span className="badge badge-amber">↓ Chiqish</span>
                  )}
                </td>

                {/* Time */}
                <td className="text-right">
                  <span className="font-mono text-[11px] font-[700] text-[#637063]">{log.time}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

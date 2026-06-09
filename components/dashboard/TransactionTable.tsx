"use client";

import { formatNumber } from "../utils";
import type { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
}

const METHOD_STYLE: Record<string, string> = {
  CASH:   "bg-emerald-50  text-emerald-700  border-emerald-100",
  CARD:   "bg-blue-50     text-blue-700     border-blue-100",
  MOBILE: "bg-violet-50   text-violet-700   border-violet-100",
};

const METHOD_LABEL: Record<string, string> = {
  CASH:   "Naqd",
  CARD:   "Terminal",
  MOBILE: "Click/Payme",
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8]">
        <div>
          <h4 className="text-sm font-[700] text-[#1e3d1f]">Tranzaksiyalar daftari</h4>
          <p className="text-[11px] text-[#637063] mt-0.5">PostgreSQL billing replika</p>
        </div>
        <span className="badge badge-slate font-mono">{transactions.length} ta yozuv</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vaqt</th>
              <th>Rasta</th>
              <th>Sotuvchi</th>
              <th className="hidden lg:table-cell">Mahsulotlar</th>
              <th>To'lov</th>
              <th className="text-right">Summa</th>
              <th className="text-center">Holat</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                {/* ID */}
                <td>
                  <span className="font-mono text-[11px] text-[#9daa9e] font-[600]">{t.id}</span>
                </td>

                {/* Time */}
                <td>
                  <span className="font-mono text-[11px] text-[#637063]">{t.createdAt}</span>
                </td>

                {/* Stall */}
                <td>
                  <p className="font-[700] text-[#1e3d1f] max-w-[100px] truncate text-xs">{t.stallName}</p>
                </td>

                {/* Employee */}
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#d8edda] text-[#1e3d1f] flex items-center justify-center text-[10px] font-[800] shrink-0">
                      {t.employeeName.charAt(0)}
                    </div>
                    <span className="text-xs font-[600] text-[#283028]">{t.employeeName}</span>
                  </div>
                </td>

                {/* Items */}
                <td className="hidden lg:table-cell">
                  <p className="text-[11px] text-[#637063] max-w-[180px] truncate">
                    {t.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                  </p>
                </td>

                {/* Payment */}
                <td>
                  <span className={`badge text-[10px] border ${METHOD_STYLE[t.paymentMethod] ?? "bg-slate-50 text-slate-600 border-slate-100"}`}>
                    {METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod}
                  </span>
                </td>

                {/* Amount */}
                <td className="text-right">
                  <span className="text-sm font-[800] text-[#1e3d1f] font-mono">
                    {formatNumber(t.amount)}
                  </span>
                  <span className="text-[10px] text-[#9daa9e] ml-1">so'm</span>
                </td>

                {/* Status */}
                <td className="text-center">
                  {t.syncStatus === "SYNCED" ? (
                    <span className="badge badge-green">✓ Sinxron</span>
                  ) : (
                    <span className="badge badge-amber animate-pulse">⏳ Kutilmoqda</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

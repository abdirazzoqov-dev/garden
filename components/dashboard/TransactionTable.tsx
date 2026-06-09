"use client";

import { formatNumber } from "../utils";
import type { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2F4EF]">
        <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">
          Tranzaksiyalar va Sotuvlar Daftari
        </h4>
        <span className="text-[10px] font-mono text-[#588157] bg-[#F2F4EF] px-2.5 py-1 rounded-full border border-[#DAD7CD] font-semibold">
          PostgreSQL Billing replica
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#F2F4EF] text-[#588157] text-[10px] uppercase tracking-wider font-bold">
              <th className="py-3 pr-3 font-semibold">ID</th>
              <th className="py-3 pr-3 font-semibold">Vaqt</th>
              <th className="py-3 pr-3 font-semibold">Rasta</th>
              <th className="py-3 pr-3 font-semibold">Xodim</th>
              <th className="py-3 pr-3 font-semibold hidden md:table-cell">Tovarlar</th>
              <th className="py-3 pr-3 font-semibold">To'lov</th>
              <th className="py-3 pr-3 font-semibold text-right">Summa</th>
              <th className="py-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F4EF]">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-[#F2F4EF]/40 transition-colors">
                <td className="py-3 pr-3 font-mono text-[#588157] font-semibold text-[10px]">
                  {t.id}
                </td>
                <td className="py-3 pr-3 text-[#588157]">{t.createdAt}</td>
                <td className="py-3 pr-3 font-bold text-[#2D452E] max-w-[100px] truncate">
                  {t.stallName}
                </td>
                <td className="py-3 pr-3 text-[#2D452E] font-bold">{t.employeeName}</td>
                <td className="py-3 pr-3 text-[#588157] hidden md:table-cell max-w-[160px] truncate">
                  {t.items.map((i) => `${i.productName} (×${i.quantity})`).join(", ")}
                </td>
                <td className="py-3 pr-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#F2F4EF] text-[#2D452E] font-bold border border-[#DAD7CD]">
                    {t.paymentMethod}
                  </span>
                </td>
                <td className="py-3 pr-3 text-right font-black font-mono text-[#3A5A40]">
                  {formatNumber(t.amount)}
                </td>
                <td className="py-3 text-center">
                  {t.syncStatus === "SYNCED" ? (
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                      ✓ Sinxron
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse whitespace-nowrap">
                      ⏳ Kutilmoqda
                    </span>
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

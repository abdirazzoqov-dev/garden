"use client";

import { AlertTriangle, Package, CheckCircle2 } from "lucide-react";
import type { Product } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";
import { formatNumber } from "../utils";

interface StockMiniPanelProps {
  products:  Product[];
  stallName: string;
}

export default function StockMiniPanel({ products, stallName }: StockMiniPanelProps) {
  const outStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert);
  const okStock  = products.filter((p) => p.stock > p.minStockAlert);

  return (
    <div className="space-y-5">
      {/* ── Summary row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "OK",       count: okStock.length,  cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: <CheckCircle2  className="w-4 h-4" /> },
          { label: "Kam",      count: lowStock.length, cls: "text-amber-600",   bg: "bg-amber-50 border-amber-100",     icon: <AlertTriangle className="w-4 h-4" /> },
          { label: "Tugagan",  count: outStock.length, cls: "text-red-600",     bg: "bg-red-50 border-red-100",         icon: <Package       className="w-4 h-4" /> },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${s.bg}`}>
            <div className={s.cls}>{s.icon}</div>
            <p className={`text-2xl font-[800] font-mono ${s.cls}`}>{s.count}</p>
            <p className="text-[10px] font-[700] text-[#637063]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Alerts first ── */}
      {(outStock.length > 0 || lowStock.length > 0) && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#f0ede8] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-[800] text-[#1e3d1f]">Diqqat talab qiluvchi mahsulotlar</h4>
          </div>
          <div className="divide-y divide-[#f7f5f2]">
            {[...outStock, ...lowStock].map((p) => {
              const catMeta = PRODUCT_CATEGORY_META[p.category];
              const isEmpty = p.stock <= 0;
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="text-xl shrink-0">{catMeta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-[700] text-[#1e3d1f] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#9daa9e]">
                      Min chegara: {p.minStockAlert} {p.unit ?? "dona"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <span className={`badge text-[10px] font-mono ${isEmpty ? "badge-red" : "badge-amber"}`}>
                      {isEmpty ? "❌" : "⚠"} {p.stock} {p.unit ?? "dona"}
                    </span>
                    <p className="text-[10px] font-[700] text-[#1e3d1f] font-mono">
                      {formatNumber(p.price)} so'm
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Full product list ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#f0ede8]">
          <h4 className="text-sm font-[800] text-[#1e3d1f]">
            {stallName} — barcha mahsulotlar ({products.length} ta)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mahsulot</th>
                <th>Kategoriya</th>
                <th className="text-right">Narx</th>
                <th className="text-right">Tannarx</th>
                <th className="text-center">Zaxira</th>
                <th className="text-center">Min</th>
                <th className="text-center">Holat</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const catMeta = PRODUCT_CATEGORY_META[p.category];
                const isEmpty = p.stock <= 0;
                const isLow   = !isEmpty && p.stock <= p.minStockAlert;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{catMeta.emoji}</span>
                        <div>
                          <p className="font-[700] text-[#1e3d1f] text-xs">{p.name}</p>
                          {!p.isAvailable && (
                            <span className="text-[9px] text-slate-400 font-[600]">Sotuvda yo'q</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-[#637063]">{catMeta.label}</span>
                    </td>
                    <td className="text-right font-mono text-xs font-[700]">
                      {formatNumber(p.price)}
                    </td>
                    <td className="text-right font-mono text-xs text-[#637063]">
                      {p.costPrice ? formatNumber(p.costPrice) : "—"}
                    </td>
                    <td className="text-center">
                      <span className={`badge text-[10px] font-mono
                        ${isEmpty ? "badge-red" : isLow ? "badge-amber" : "badge-green"}`}>
                        {p.stock} {p.unit ?? "dona"}
                      </span>
                    </td>
                    <td className="text-center text-xs font-mono text-[#637063]">
                      {p.minStockAlert}
                    </td>
                    <td className="text-center">
                      {isEmpty
                        ? <span className="badge badge-red text-[10px]">Tugagan</span>
                        : isLow
                        ? <span className="badge badge-amber text-[10px]">Kam</span>
                        : <span className="badge badge-green text-[10px]">Yaxshi</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

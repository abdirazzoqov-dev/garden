"use client";

import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Product } from "../types";

interface InventoryPanelProps {
  products: Product[];
}

export default function InventoryPanel({ products }: InventoryPanelProps) {
  const critical = products.filter((p) => p.stock <= p.minStockAlert).length;

  return (
    <div className="card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-[700] text-[#1e3d1f]">Ombor monitoringi</h4>
          <p className="text-[11px] text-[#637063] mt-0.5">Zaxira qoldiqlari holati</p>
        </div>
        {critical > 0 ? (
          <span className="badge badge-amber">
            <AlertTriangle className="w-3 h-3" />
            {critical} ta kam
          </span>
        ) : (
          <span className="badge badge-green">
            <CheckCircle2 className="w-3 h-3" />
            Yaxshi
          </span>
        )}
      </div>

      {/* Product list */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {products.map((p) => {
          const isEmpty  = p.stock <= 0;
          const isLow    = !isEmpty && p.stock <= p.minStockAlert;
          const isOk     = !isEmpty && !isLow;
          const fillPct  = Math.min(100, (p.stock / Math.max(p.minStockAlert * 4, 1)) * 100);

          return (
            <div
              key={p.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl border transition-all
                ${isEmpty ? "bg-slate-50 border-slate-200"
                  : isLow  ? "bg-amber-50 border-amber-100"
                  : "bg-[#f7f5f2] border-[#f0ede8]"
                }
              `}
            >
              {/* Icon */}
              <div className={`p-1.5 rounded-lg shrink-0
                ${isEmpty ? "bg-slate-100 text-slate-400"
                  : isLow  ? "bg-amber-100 text-amber-600"
                  : "bg-[#eef7ef] text-[#4d8751]"
                }
              `}>
                <Package className="w-3.5 h-3.5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-[700] text-[#1e3d1f] truncate">{p.name}</p>
                  <span className={`text-[10px] font-[700] font-mono px-2 py-0.5 rounded-full shrink-0
                    ${isEmpty ? "bg-slate-100 text-slate-500"
                      : isLow  ? "bg-amber-100 text-amber-800"
                      : "bg-[#eef7ef] text-[#1e3d1f]"
                    }
                  `}>
                    {p.stock} dona
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full bg-white/70 rounded-full overflow-hidden border border-[#f0ede8]">
                  <div
                    className={`h-full rounded-full transition-all duration-500
                      ${isEmpty ? "w-0"
                        : isLow  ? "bg-amber-400"
                        : "bg-[#4d8751]"
                      }
                    `}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>

                <p className="text-[10px] text-[#9daa9e] font-[500]">
                  Min chegara: {p.minStockAlert} · {p.stallName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Plus, AlertTriangle, Package } from "lucide-react";
import { formatNumber } from "../utils";
import type { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  stallId: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, stallId, onAddToCart }: ProductGridProps) {
  const filtered = products.filter((p) => p.stallId === stallId);

  if (filtered.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center gap-3 text-[#9daa9e]">
        <Package className="w-10 h-10 stroke-[1.5]" />
        <p className="text-sm font-[600]">Bu rastada mahsulot topilmadi</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Mahsulotlar</p>
        <span className="text-xs text-[#637063] font-[600]">{filtered.length} ta</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const isLow   = p.stock > 0 && p.stock <= p.minStockAlert;
          const isEmpty = p.stock <= 0;
          const stockPct = Math.min(100, (p.stock / (p.minStockAlert * 3)) * 100);

          return (
            <div
              key={p.id}
              className={`
                card card-hover flex flex-col overflow-hidden
                ${isLow   ? "border-amber-300" : ""}
                ${isEmpty ? "border-slate-200 opacity-70" : ""}
              `}
            >
              {/* ── Top accent bar ── */}
              <div className={`h-1 w-full
                ${isEmpty ? "bg-slate-200"
                  : isLow  ? "bg-gradient-to-r from-amber-400 to-orange-400"
                  : "bg-gradient-to-r from-[#4d8751] to-[#6aaa6e]"
                }`}
              />

              <div className="p-4 flex flex-col flex-1 gap-3">
                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-[700] text-[#9daa9e] font-mono uppercase tracking-wider">
                      {p.id}
                    </p>
                    <h4 className="text-sm font-[700] text-[#1e3d1f] leading-snug mt-0.5">
                      {p.name}
                    </h4>
                  </div>
                  {isLow && (
                    <span className="badge badge-amber shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Kam
                    </span>
                  )}
                  {isEmpty && (
                    <span className="badge badge-slate shrink-0">Tugadi</span>
                  )}
                </div>

                {/* ── Price ── */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-[600] text-[#637063]">Narx</p>
                    <p className="text-lg font-[800] text-[#1e3d1f] leading-none">
                      {formatNumber(p.price)}
                      <span className="text-xs font-[600] text-[#637063] ml-1">so'm</span>
                    </p>
                  </div>

                  {/* Stock pill */}
                  <div className="text-right">
                    <p className="text-[10px] font-[600] text-[#637063]">Ombor</p>
                    <span className={`
                      text-xs font-[700] font-mono px-2 py-0.5 rounded-full
                      ${isEmpty ? "bg-slate-100 text-slate-500"
                        : isLow  ? "bg-amber-100 text-amber-800"
                        : "bg-[#eef7ef] text-[#1e3d1f]"
                      }
                    `}>
                      {p.stock} dona
                    </span>
                  </div>
                </div>

                {/* ── Stock progress ── */}
                <div className="h-1 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500
                      ${isEmpty ? "w-0"
                        : isLow  ? "bg-amber-400"
                        : "bg-[#4d8751]"
                      }
                    `}
                    style={{ width: `${isEmpty ? 0 : stockPct}%` }}
                  />
                </div>

                {/* ── Add button ── */}
                <button
                  onClick={() => onAddToCart(p)}
                  disabled={isEmpty}
                  className={`
                    btn btn-full mt-auto
                    ${isEmpty
                      ? "btn-secondary opacity-50 cursor-not-allowed"
                      : "btn-primary"
                    }
                  `}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isEmpty ? "Mavjud emas" : "Savatga qo'shish"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

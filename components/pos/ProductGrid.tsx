"use client";

import { Plus, AlertTriangle } from "lucide-react";
import { formatNumber } from "../utils";
import type { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  stallId: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, stallId, onAddToCart }: ProductGridProps) {
  const filtered = products.filter((p) => p.stallId === stallId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">
          Sotiladigan Tovar va Chiptalar
        </h3>
        <span className="text-[11px] text-[#588157] font-semibold">
          {filtered.length} ta mahsulot
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const isLow = p.stock <= p.minStockAlert;
          const isEmpty = p.stock <= 0;
          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl relative flex flex-col justify-between transition-all border ${
                isLow
                  ? "bg-white border-amber-300 shadow-sm"
                  : "bg-white border-[#DAD7CD] hover:border-[#588157] hover:shadow-md"
              }`}
            >
              {/* Low stock badge */}
              {isLow && (
                <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="h-2.5 w-2.5" /> Kam qoldi
                </span>
              )}

              <div className="mb-3">
                <span className="text-[9px] text-[#A3B18A] font-bold font-mono uppercase tracking-wider">
                  {p.id}
                </span>
                <h4 className="text-sm font-bold text-[#2D452E] mt-1 leading-snug pr-12">{p.name}</h4>
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-[10px] text-[#588157] font-bold block">Narx:</span>
                  <span className="text-base font-black text-[#3A5A40]">
                    {formatNumber(p.price)} so'm
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#588157] font-bold block">Ombor:</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isLow
                        ? "text-amber-800 bg-amber-100 border-amber-200"
                        : "text-[#2D3A2D] bg-[#F2F4EF] border-[#DAD7CD]"
                    }`}
                  >
                    {p.stock} dona
                  </span>
                </div>
              </div>

              <button
                onClick={() => onAddToCart(p)}
                disabled={isEmpty}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isEmpty
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-[#2D452E] hover:bg-[#3A5A40] text-white shadow active:scale-[0.98]"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                {isEmpty ? "Tugadi" : "Savatga qo'shish"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle } from "lucide-react";
import type { Product } from "../types";

interface InventoryPanelProps {
  products: Product[];
}

export default function InventoryPanel({ products }: InventoryPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#DAD7CD] shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-bold text-[#2D452E] uppercase tracking-wider">
            Ombor Qoldiqlari Monitoringi
          </h4>
          <p className="text-[10px] text-[#588157] mt-0.5">
            Kam qolayotgan tovarlarni o'z vaqtida ta'minlash ogohlantirishlari
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 font-bold flex items-center gap-1 shrink-0">
          <AlertTriangle className="h-3 w-3" /> Re-stock
        </span>
      </div>

      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {products.map((p) => {
          const isWarning = p.stock <= p.minStockAlert;
          const pct = Math.min(100, (p.stock / 150) * 100);

          return (
            <div
              key={p.id}
              className="bg-[#F2F4EF]/50 p-3 rounded-xl border border-[#DAD7CD] flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-[#2D452E] truncate">{p.name}</h5>
                <p className="text-[9px] text-[#588157] font-semibold mt-0.5 truncate">
                  {p.stallName}
                </p>
              </div>

              {/* Progress bar (hidden on small screens) */}
              <div className="flex-1 max-w-[100px] hidden md:block">
                <div className="h-1.5 w-full bg-[#DAD7CD]/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWarning ? "bg-amber-500" : "bg-[#3A5A40]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isWarning
                      ? "text-amber-800 bg-amber-100 border-amber-200"
                      : "text-[#2D3A2D] bg-[#DAD7CD]/30 border-[#DAD7CD]"
                  }`}
                >
                  {p.stock} dona
                </span>
                <span className="text-[9px] text-[#588157] font-mono hidden sm:inline">
                  min:{p.minStockAlert}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

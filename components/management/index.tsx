"use client";

import { motion } from "motion/react";
import { Store, Package } from "lucide-react";
import StallManager   from "./StallManager";
import ProductManager from "./ProductManager";
import type { Stall, Product, ManagementSubTab } from "../types";

interface ManagementTabProps {
  subTab:          ManagementSubTab;
  onSubTabChange:  (t: ManagementSubTab) => void;
  stalls:    Stall[];
  products:  Product[];
  onAddStall:      (stall: Stall)     => void;
  onUpdateStall:   (stall: Stall)     => void;
  onDeleteStall:   (id: string)       => void;
  onAddProduct:    (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string)       => void;
  onToggleProductAvailable: (id: string) => void;
}

const SUB_TABS: { id: ManagementSubTab; label: string; icon: React.ReactNode }[] = [
  { id: "stalls",   label: "Rastalar",    icon: <Store   className="w-4 h-4" /> },
  { id: "products", label: "Mahsulotlar", icon: <Package className="w-4 h-4" /> },
];

export default function ManagementTab({
  subTab, onSubTabChange,
  stalls, products,
  onAddStall, onUpdateStall, onDeleteStall,
  onAddProduct, onUpdateProduct, onDeleteProduct,
  onToggleProductAvailable,
}: ManagementTabProps) {
  return (
    <motion.div
      key="management"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* ── Sub-tab switcher ── */}
      <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3] w-fit">
        {SUB_TABS.map((t) => {
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSubTabChange(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[700] transition-all
                ${isActive
                  ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]"
                  : "text-[#637063] hover:text-[#1e3d1f] hover:bg-white/60"
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {subTab === "stalls" && (
        <StallManager
          stalls={stalls}
          onAdd={onAddStall}
          onUpdate={onUpdateStall}
          onDelete={onDeleteStall}
        />
      )}

      {subTab === "products" && (
        <ProductManager
          products={products}
          stalls={stalls}
          onAdd={onAddProduct}
          onUpdate={onUpdateProduct}
          onDelete={onDeleteProduct}
          onToggleAvailable={onToggleProductAvailable}
        />
      )}
    </motion.div>
  );
}

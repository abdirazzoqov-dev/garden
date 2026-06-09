"use client";

import { useState } from "react";
import { ShoppingCart, Package, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type {
  Stall, Product, Transaction, Employee,
  CartItem, PaymentMethod, StallPanelTab,
} from "../types";
import { computeStallMetrics } from "./utils";
import StallOverviewHeader from "./StallOverviewHeader";
import POSTab  from "../pos";
import StockMiniPanel from "./StockMiniPanel";
import StallAnalytics from "./StallAnalytics";

interface ShopPanelProps {
  stall: Stall;
  products: Product[];
  transactions: Transaction[];
  employees: Employee[];
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  isOnline: boolean;
  syncQueue: Transaction[];
  activeSellerId: string;
  wsEvents: any[];
  onAddToCart: (p: Product) => void;
  onUpdateCartQty: (id: string, d: number) => void;
  onSetPayment: (m: PaymentMethod) => void;
  onCheckout: () => void;
  onSyncNow: () => void;
  onOpenSellerAuth: (id: string) => void;
}

const TABS: { id: StallPanelTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Ko'rinish", icon: <BarChart3    className="w-4 h-4" /> },
  { id: "pos",       label: "Kassa",     icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "stock",     label: "Zaxira",    icon: <Package      className="w-4 h-4" /> },
];

export default function ShopPanel({
  stall, products, transactions, employees,
  cart, paymentMethod, isOnline, syncQueue, activeSellerId, wsEvents,
  onAddToCart, onUpdateCartQty, onSetPayment, onCheckout, onSyncNow, onOpenSellerAuth,
}: ShopPanelProps) {
  const [activeTab, setActiveTab] = useState<StallPanelTab>("overview");

  const metrics = computeStallMetrics(stall, products, transactions, [], [], employees);
  const stallProducts = products.filter((p) => p.stallId === stall.id && p.isAvailable);

  // Accent color for STALL type
  const accentClass = stall.type === "SERVICE"
    ? "bg-slate-600"
    : "bg-purple-700";

  return (
    <div className="space-y-5">
      {/* ── Sub-tab nav ── */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3] w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[700]
                transition-all duration-150 whitespace-nowrap
                ${isActive ? `${accentClass} text-white shadow-sm` : "text-[#637063] hover:text-[#1e3d1f] hover:bg-white/60"}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <StallOverviewHeader stall={stall} metrics={metrics} transactions={transactions} orders={[]} />
          </motion.div>
        )}

        {activeTab === "pos" && (
          <motion.div key="pos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <POSTab
              stalls={[stall]}
              employees={employees}
              products={stallProducts}
              cart={cart}
              wsEvents={wsEvents}
              syncQueue={syncQueue}
              selectedStallId={stall.id}
              activeSellerId={activeSellerId}
              paymentMethod={paymentMethod}
              isOnline={isOnline}
              onSelectStall={() => {}}
              onOpenSellerAuth={onOpenSellerAuth}
              onAddToCart={onAddToCart}
              onUpdateCartQty={onUpdateCartQty}
              onSetPayment={onSetPayment}
              onCheckout={onCheckout}
              onSyncNow={onSyncNow}
            />
          </motion.div>
        )}

        {activeTab === "stock" && (
          <motion.div key="stk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <StockMiniPanel products={products.filter((p) => p.stallId === stall.id)} stallName={stall.name} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

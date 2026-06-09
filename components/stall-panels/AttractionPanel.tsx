"use client";

import { useState } from "react";
import { Ticket, ShoppingCart, Package, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type {
  Stall, Product, Transaction, Employee,
  CartItem, PaymentMethod, StallPanelTab,
} from "../types";
import { formatNumber } from "../utils";
import { computeStallMetrics } from "./utils";
import StallOverviewHeader from "./StallOverviewHeader";
import POSTab from "../pos";
import StockMiniPanel from "./StockMiniPanel";

interface AttractionPanelProps {
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
  { id: "overview", label: "Ko'rinish", icon: <BarChart3    className="w-4 h-4" /> },
  { id: "tickets",  label: "Chipta",    icon: <Ticket       className="w-4 h-4" /> },
  { id: "pos",      label: "Kassa",     icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "stock",    label: "Zaxira",    icon: <Package      className="w-4 h-4" /> },
];

export default function AttractionPanel({
  stall, products, transactions, employees,
  cart, paymentMethod, isOnline, syncQueue, activeSellerId, wsEvents,
  onAddToCart, onUpdateCartQty, onSetPayment, onCheckout, onSyncNow, onOpenSellerAuth,
}: AttractionPanelProps) {
  const [activeTab, setActiveTab] = useState<StallPanelTab>("overview");

  const metrics = computeStallMetrics(stall, products, transactions, [], [], employees);
  const stallProducts = products.filter((p) => p.stallId === stall.id && p.isAvailable);
  const ticketProducts = stallProducts.filter((p) => p.category === "TICKET");

  // Ticket sales stats
  const ticketsSold = transactions
    .filter((t) => t.stallId === stall.id)
    .reduce((s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0), 0);

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
                ${isActive ? "bg-blue-700 text-white shadow-sm" : "text-[#637063] hover:text-[#1e3d1f] hover:bg-white/60"}`}
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

        {activeTab === "tickets" && (
          <motion.div key="tkt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Ticket quick-stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              <div className="card p-4 text-center">
                <p className="text-[10px] font-[700] text-[#9daa9e] uppercase tracking-wide mb-1">Sotilgan</p>
                <p className="text-2xl font-[800] text-blue-700">{ticketsSold}</p>
                <p className="text-xs text-[#637063]">chipta</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] font-[700] text-[#9daa9e] uppercase tracking-wide mb-1">Tushum</p>
                <p className="text-lg font-[800] text-[#1e3d1f] font-mono">{formatNumber(metrics.revenue)} so'm</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] font-[700] text-[#9daa9e] uppercase tracking-wide mb-1">Tranzaksiyalar</p>
                <p className="text-2xl font-[800] text-[#1e3d1f]">{metrics.orderCount}</p>
              </div>
            </div>

            {/* Ticket products */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ede8]">
                <h4 className="text-sm font-[800] text-[#1e3d1f]">Chipta turlari</h4>
              </div>
              <div className="divide-y divide-[#f7f5f2]">
                {ticketProducts.length === 0 ? (
                  <p className="p-8 text-center text-[#9daa9e] text-sm">Chipta mahsuloti topilmadi</p>
                ) : ticketProducts.map((p) => {
                  const sold = transactions
                    .filter((t) => t.stallId === stall.id)
                    .reduce((s, t) => s + t.items.filter((i) => i.productName === p.name).reduce((a, i) => a + i.quantity, 0), 0);
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f5f2] transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">
                        🎫
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-[700] text-[#1e3d1f]">{p.name}</p>
                        <p className="text-xs text-[#637063]">{formatNumber(p.price)} so'm / dona</p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-sm font-[800] text-blue-700 font-mono">{sold} ta sotildi</p>
                        <p className="text-xs text-[#9daa9e]">{p.stock} ta qoldi</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

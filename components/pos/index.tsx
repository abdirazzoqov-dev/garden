"use client";

import { WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { formatNumber } from "../utils";
import StallSelector from "./StallSelector";
import ProductGrid from "./ProductGrid";
import CartPanel from "./CartPanel";
import WsFeed from "./WsFeed";
import type {
  Stall, Employee, Product, CartItem,
  PaymentMethod, WsEvent, Transaction,
} from "../types";

interface POSTabProps {
  stalls: Stall[];
  employees: Employee[];
  products: Product[];
  cart: CartItem[];
  wsEvents: WsEvent[];
  syncQueue: Transaction[];
  selectedStallId: string;
  activeSellerId: string;
  paymentMethod: PaymentMethod;
  isOnline: boolean;
  onSelectStall: (id: string) => void;
  onOpenSellerAuth: (empId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onSetPayment: (m: PaymentMethod) => void;
  onCheckout: () => void;
  onSyncNow: () => void;
}

export default function POSTab({
  stalls, employees, products, cart, wsEvents, syncQueue,
  selectedStallId, activeSellerId, paymentMethod, isOnline,
  onSelectStall, onOpenSellerAuth, onAddToCart,
  onUpdateCartQty, onSetPayment, onCheckout, onSyncNow,
}: POSTabProps) {
  const activeSeller = employees.find((e) => e.id === activeSellerId) ?? employees[0];

  const handleStallSelect = (id: string) => {
    onSelectStall(id);
  };

  return (
    <motion.div
      key="pos"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* ── Left column (8/12) ── */}
      <div className="lg:col-span-8 space-y-5">

        {/* Stall selector */}
        <StallSelector
          stalls={stalls}
          selectedStallId={selectedStallId}
          onSelect={handleStallSelect}
        />

        {/* Active seller bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F2F4EF] p-4 rounded-2xl border border-[#DAD7CD]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#A3B18A] flex items-center justify-center text-[#2D452E] font-bold text-sm shrink-0">
              {activeSeller.name.charAt(0)}
            </div>
            <div>
              <span className="text-[9px] text-[#588157] block uppercase tracking-wider font-bold">
                Navbatchi Sotuvchi:
              </span>
              <select
                value={activeSellerId}
                onChange={(e) => onOpenSellerAuth(e.target.value)}
                className="bg-transparent text-sm font-bold text-[#2D452E] focus:outline-none pr-4 cursor-pointer border-b border-transparent focus:border-[#3A5A40] transition-colors"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="bg-white text-[#2D3A2D]">
                    {emp.name} ({emp.role}){!emp.isCheckedIn ? " [Nofaol]" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isOnline ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium px-3 py-1.5 bg-emerald-100 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              PostgreSQL bilan faol ulangan
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium px-3 py-1.5 bg-amber-100 rounded-full border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Offline — Navbat: {syncQueue.length} ta
            </div>
          )}
        </div>

        {/* Product grid */}
        <ProductGrid
          products={products}
          stallId={selectedStallId}
          onAddToCart={onAddToCart}
        />

        {/* Offline sync banner */}
        {!isOnline && syncQueue.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl border border-amber-200 shrink-0">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                IndexedDB Tarmoqsiz Zaxira Sinxronizatsiyasi
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Siz offline rejimda sotuvlarni davom ettirdingiz. Tranzaksiyalar{" "}
                <strong>IndexedDB navbatida</strong> saqlanmoqda. Internet tiklanganda
                serverga yuboriladi.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                  Navbatda: {syncQueue.length} ta tranzaksiya
                </span>
                <button
                  onClick={onSyncNow}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  Online-ga o'tkazish & Sinxronlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right column (4/12) ── */}
      <div className="lg:col-span-4 space-y-5">
        <CartPanel
          cart={cart}
          paymentMethod={paymentMethod}
          isOnline={isOnline}
          syncQueueLength={syncQueue.length}
          onUpdateQty={onUpdateCartQty}
          onSetPayment={onSetPayment}
          onCheckout={onCheckout}
        />
        <WsFeed events={wsEvents} />
      </div>
    </motion.div>
  );
}

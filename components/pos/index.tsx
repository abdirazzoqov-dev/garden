"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
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

  return (
    <motion.div
      key="pos"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* ── Left column ──────────────────────────────── */}
      <div className="lg:col-span-8 space-y-5">

        {/* Stall selector */}
        <StallSelector
          stalls={stalls}
          selectedStallId={selectedStallId}
          onSelect={onSelectStall}
        />

        {/* Active seller bar */}
        <div className="card px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#1e3d1f] flex items-center justify-center text-white font-[800] text-sm shrink-0">
              {activeSeller.name.charAt(0)}
            </div>
            <div>
              <p className="section-label mb-0.5">Navbatchi sotuvchi</p>
              <select
                value={activeSellerId}
                onChange={(e) => onOpenSellerAuth(e.target.value)}
                className="bg-transparent text-sm font-[700] text-[#1e3d1f] focus:outline-none cursor-pointer
                           border-b border-transparent hover:border-[#4d8751] transition-colors pr-2"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="bg-white">
                    {emp.name}{!emp.isCheckedIn ? " [Nofaol]" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Connection status */}
          {isOnline ? (
            <span className="badge badge-green">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
              PostgreSQL ulangan
            </span>
          ) : (
            <span className="badge badge-amber">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot" />
              Offline — {syncQueue.length} ta navbatda
            </span>
          )}
        </div>

        {/* Products */}
        <ProductGrid
          products={products}
          stallId={selectedStallId}
          onAddToCart={onAddToCart}
        />

        {/* Offline sync banner */}
        {!isOnline && syncQueue.length > 0 && (
          <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2.5 bg-amber-100 border border-amber-200 rounded-xl shrink-0">
                <WifiOff className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-[700] text-amber-900">
                  IndexedDB Offline Sinxronizatsiyasi
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>{syncQueue.length} ta tranzaksiya</strong> mahalliy xotirada saqlanmoqda.
                  Internet tiklanganda serverga avtomatik yuboriladi.
                </p>
                <button onClick={onSyncNow} className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white border-0">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Online-ga o'tkazish & Sinxronlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right column ─────────────────────────────── */}
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

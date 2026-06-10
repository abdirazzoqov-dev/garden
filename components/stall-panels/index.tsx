"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import StallSelector    from "./StallSelector";
import AdminMonitoring  from "./AdminMonitoring";
import FastFoodPanel    from "./FastFoodPanel";
import TeahousePanel    from "./TeahousePanel";
import ShopPanel        from "./ShopPanel";
import AttractionPanel  from "./AttractionPanel";
import { computeStallMetrics } from "./utils";
import type {
  Stall, Product, Transaction, Order, OrderItem, OrderStatus,
  Table, Employee, CartItem, PaymentMethod,
} from "../types";

interface StallPanelsProps {
  stalls:       Stall[];
  products:     Product[];
  transactions: Transaction[];
  orders:       Order[];
  tables:       Table[];
  employees:    Employee[];
  isOnline:     boolean;
  wsEvents:     any[];
  syncQueue:    Transaction[];
  // POS passthrough
  cart:            CartItem[];
  paymentMethod:   PaymentMethod;
  activeSellerId:  string;
  onAddToCart:     (p: Product) => void;
  onUpdateCartQty: (id: string, d: number) => void;
  onSetPayment:    (m: PaymentMethod) => void;
  onCheckout:      () => void;
  onSyncNow:       () => void;
  onOpenSellerAuth:(id: string) => void;
  // Orders passthrough
  onOpenTable:             any;
  onAddItemToOrder:        any;
  onRemoveItemFromOrder:   any;
  onUpdateOrderStatus:     (orderId: string, status: OrderStatus) => void;
  onPayOrder:              any;
  onSetReservation:        any;
  onCancelReservation:     any;
  onUpdateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem["status"]) => void;
}

export default function StallPanels({
  stalls, products, transactions, orders, tables, employees,
  isOnline, wsEvents, syncQueue,
  cart, paymentMethod, activeSellerId,
  onAddToCart, onUpdateCartQty, onSetPayment, onCheckout, onSyncNow, onOpenSellerAuth,
  onOpenTable, onAddItemToOrder, onRemoveItemFromOrder,
  onUpdateOrderStatus, onPayOrder, onSetReservation, onCancelReservation,
  onUpdateOrderItemStatus,
}: StallPanelsProps) {
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);

  // Build metrics map for all stalls
  const metricsMap = Object.fromEntries(
    stalls.map((s) => [
      s.id,
      computeStallMetrics(s, products, transactions, orders, tables, employees),
    ])
  );

  const selectedStall = stalls.find((s) => s.id === selectedStallId) ?? null;

  // Common heavy-prop bundle for individual panels
  const orderProps = {
    tables, onOpenTable, onAddItemToOrder, onRemoveItemFromOrder,
    onUpdateOrderStatus, onPayOrder, onSetReservation, onCancelReservation,
    onUpdateOrderItemStatus,
  };
  const posProps = {
    cart, paymentMethod, isOnline, syncQueue, activeSellerId, wsEvents,
    onAddToCart, onUpdateCartQty, onSetPayment, onCheckout, onSyncNow, onOpenSellerAuth,
  };

  return (
    <motion.div
      key="stall-panels"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col lg:flex-row gap-5"
    >
      {/* ── Mobile sidebar toggle ── */}
      <div className="lg:hidden flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="btn btn-secondary btn-sm"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {selectedStall ? selectedStall.name : "Admin Panel"}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <div className={`lg:block ${sidebarOpen ? "block" : "hidden"}`}>
        <StallSelector
          stalls={stalls}
          metricsMap={metricsMap}
          selectedStallId={selectedStallId}
          onSelect={(id) => {
            setSelectedStallId(id);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">

          {/* Admin monitoring (no stall selected) */}
          {!selectedStall && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              <AdminMonitoring
                stalls={stalls}
                products={products}
                transactions={transactions}
                orders={orders}
                tables={tables}
                employees={employees}
                isOnline={isOnline}
                wsEvents={wsEvents}
                onSelectStall={(id) => setSelectedStallId(id)}
              />
            </motion.div>
          )}

          {/* Fast-food panel */}
          {selectedStall?.type === "FASTFOOD" && (
            <motion.div key={`ff-${selectedStall.id}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <FastFoodPanel
                stall={selectedStall}
                products={products}
                transactions={transactions}
                orders={orders}
                employees={employees}
                {...posProps}
                {...orderProps}
              />
            </motion.div>
          )}

          {/* Teahouse / Cafe panel */}
          {(selectedStall?.type === "TEAHOUSE" || selectedStall?.type === "CAFE") && (
            <motion.div key={`th-${selectedStall.id}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <TeahousePanel
                stall={selectedStall}
                products={products}
                transactions={transactions}
                orders={orders}
                employees={employees}
                {...orderProps}
              />
            </motion.div>
          )}

          {/* Attraction panel */}
          {selectedStall?.type === "ATTRACTION" && (
            <motion.div key={`at-${selectedStall.id}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <AttractionPanel
                stall={selectedStall}
                products={products}
                transactions={transactions}
                employees={employees}
                {...posProps}
              />
            </motion.div>
          )}

          {/* Shop / Service panel */}
          {(selectedStall?.type === "STALL" || selectedStall?.type === "SERVICE") && (
            <motion.div key={`sh-${selectedStall.id}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <ShopPanel
                stall={selectedStall}
                products={products}
                transactions={transactions}
                employees={employees}
                {...posProps}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { ShoppingCart, ClipboardList, ChefHat, Package, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type {
  Stall, Product, Transaction, Order, OrderItem, OrderStatus,
  Employee, CartItem, PaymentMethod, StallPanelTab,
} from "../types";
import { formatNumber } from "../utils";
import { computeStallMetrics } from "./utils";
import StallOverviewHeader from "./StallOverviewHeader";

// ── Lazy sub-tabs (re-use existing heavy components) ─────────
import POSTab    from "../pos";
import OrdersTab from "../orders";
import KDSTab    from "../kds";
import StockMiniPanel from "./StockMiniPanel";
import StallAnalytics from "./StallAnalytics";

interface FastFoodPanelProps {
  stall: Stall;
  products: Product[];
  transactions: Transaction[];
  orders: Order[];
  employees: Employee[];
  // POS props
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
  // Orders props
  tables: any[];
  onOpenTable: any;
  onAddItemToOrder: any;
  onRemoveItemFromOrder: any;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onPayOrder: any;
  onSetReservation: any;
  onCancelReservation: any;
  onUpdateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem["status"]) => void;
}

const TABS: { id: StallPanelTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Ko'rinish",   icon: <BarChart3    className="w-4 h-4" /> },
  { id: "pos",       label: "Kassa",       icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "orders",    label: "Buyurtmalar", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "kitchen",   label: "Oshpazxona",  icon: <ChefHat      className="w-4 h-4" /> },
  { id: "stock",     label: "Zaxira",      icon: <Package      className="w-4 h-4" /> },
];

export default function FastFoodPanel({
  stall, products, transactions, orders, employees,
  cart, paymentMethod, isOnline, syncQueue, activeSellerId, wsEvents,
  onAddToCart, onUpdateCartQty, onSetPayment, onCheckout, onSyncNow, onOpenSellerAuth,
  tables, onOpenTable, onAddItemToOrder, onRemoveItemFromOrder,
  onUpdateOrderStatus, onPayOrder, onSetReservation, onCancelReservation,
  onUpdateOrderItemStatus,
}: FastFoodPanelProps) {
  const [activeTab,       setActiveTab]       = useState<StallPanelTab>("overview");
  const [activeOrderId,   setActiveOrderId]   = useState<string | null>(null);
  const [selectedOrderStallId] = useState(stall.id);

  const metrics = computeStallMetrics(stall, products, transactions, orders, tables, employees);
  const stallProducts = products.filter((p) => p.stallId === stall.id && p.isAvailable);

  const pendingCount = orders.filter(
    (o) => o.stallId === stall.id &&
      (o.status === "NEW" || o.status === "CONFIRMED" || o.status === "PREPARING")
  ).length;

  return (
    <div className="space-y-5">
      {/* ── Sub-tab nav ── */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3] w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge =
            tab.id === "orders"  && pendingCount > 0 ? pendingCount :
            tab.id === "kitchen" && pendingCount > 0 ? pendingCount : null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[700]
                transition-all duration-150 whitespace-nowrap
                ${isActive ? "bg-orange-600 text-white shadow-sm" : "text-[#637063] hover:text-[#1e3d1f] hover:bg-white/60"}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {badge && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-[800] flex items-center justify-center shrink-0">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <StallOverviewHeader stall={stall} metrics={metrics} transactions={transactions} orders={orders} />
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

        {activeTab === "orders" && (
          <motion.div key="ord" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <OrdersTab
              stalls={[stall]}
              tables={tables}
              orders={orders}
              products={stallProducts}
              employees={employees}
              selectedOrderStallId={stall.id}
              onSelectOrderStall={() => {}}
              activeOrderId={activeOrderId}
              onSetActiveOrder={setActiveOrderId}
              onOpenTable={onOpenTable}
              onAddItemToOrder={onAddItemToOrder}
              onRemoveItemFromOrder={onRemoveItemFromOrder}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onPayOrder={onPayOrder}
              onSetReservation={onSetReservation}
              onCancelReservation={onCancelReservation}
            />
          </motion.div>
        )}

        {activeTab === "kitchen" && (
          <motion.div key="kds" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <KDSTab
              orders={orders.filter((o) => o.stallId === stall.id)}
              stalls={[stall]}
              onUpdateItemStatus={onUpdateOrderItemStatus}
              onUpdateOrderStatus={onUpdateOrderStatus}
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

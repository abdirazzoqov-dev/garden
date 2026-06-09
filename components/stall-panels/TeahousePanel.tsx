"use client";

import { useState } from "react";
import { LayoutGrid, ClipboardList, ChefHat, Package, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type {
  Stall, Product, Transaction, Order, OrderItem, OrderStatus,
  Employee, StallPanelTab,
} from "../types";
import { computeStallMetrics } from "./utils";
import StallOverviewHeader from "./StallOverviewHeader";
import OrdersTab from "../orders";
import KDSTab    from "../kds";
import StockMiniPanel from "./StockMiniPanel";
import StallAnalytics from "./StallAnalytics";

interface TeahousePanelProps {
  stall: Stall;
  products: Product[];
  transactions: Transaction[];
  orders: Order[];
  employees: Employee[];
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
  { id: "overview", label: "Ko'rinish",   icon: <BarChart3     className="w-4 h-4" /> },
  { id: "tables",   label: "Stol rejasi", icon: <LayoutGrid    className="w-4 h-4" /> },
  { id: "orders",   label: "Buyurtmalar", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "kitchen",  label: "Oshpazxona",  icon: <ChefHat       className="w-4 h-4" /> },
  { id: "stock",    label: "Zaxira",      icon: <Package       className="w-4 h-4" /> },
];

export default function TeahousePanel({
  stall, products, transactions, orders, employees,
  tables, onOpenTable, onAddItemToOrder, onRemoveItemFromOrder,
  onUpdateOrderStatus, onPayOrder, onSetReservation, onCancelReservation,
  onUpdateOrderItemStatus,
}: TeahousePanelProps) {
  const [activeTab,     setActiveTab]     = useState<StallPanelTab>("overview");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const metrics = computeStallMetrics(stall, products, transactions, orders, tables, employees);
  const stallProducts = products.filter((p) => p.stallId === stall.id && p.isAvailable);

  const pendingCount = orders.filter(
    (o) => o.stallId === stall.id &&
      (o.status === "NEW" || o.status === "CONFIRMED" || o.status === "PREPARING")
  ).length;

  const tablesOccupied = tables.filter(
    (t) => t.stallId === stall.id && (t.status === "OCCUPIED" || t.status === "BILL_REQUESTED")
  ).length;

  return (
    <div className="space-y-5">
      {/* ── Sub-tab nav ── */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f0ede8] rounded-2xl border border-[#dedad3] w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge =
            tab.id === "orders"  && pendingCount   > 0 ? pendingCount   :
            tab.id === "kitchen" && pendingCount   > 0 ? pendingCount   :
            tab.id === "tables"  && tablesOccupied > 0 ? tablesOccupied : null;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-[700]
                transition-all duration-150 whitespace-nowrap
                ${isActive ? "bg-emerald-700 text-white shadow-sm" : "text-[#637063] hover:text-[#1e3d1f] hover:bg-white/60"}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {badge && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-[800] flex items-center justify-center">
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

        {/* Tables + Orders combined for choyxona */}
        {(activeTab === "tables" || activeTab === "orders") && (
          <motion.div key="tbl-ord" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
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

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid, List, Plus, Filter,
  ShoppingBag, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import FloorPlan  from "./FloorPlan";
import OrderCard  from "./OrderCard";
import OrderPanel from "./OrderPanel";
import type {
  Stall, Table, Order, Product, Employee,
  OrderStatus, PaymentMethod, OrderType,
} from "../types";
import { STALL_TYPE_META } from "../constants";
import { formatNumber } from "../utils";

interface OrdersTabProps {
  stalls:    Stall[];
  tables:    Table[];
  orders:    Order[];
  products:  Product[];
  employees: Employee[];
  selectedOrderStallId:    string;
  onSelectOrderStall:      (id: string) => void;
  activeOrderId:           string | null;
  onSetActiveOrder:        (id: string | null) => void;
  onOpenTable:             (tableId: string, guestCount: number, waiterId?: string) => void;
  onAddItemToOrder:        (orderId: string, product: Product, qty: number, note?: string) => void;
  onRemoveItemFromOrder:   (orderId: string, itemId: string) => void;
  onUpdateOrderStatus:     (orderId: string, status: OrderStatus) => void;
  onPayOrder:              (orderId: string, method: PaymentMethod) => void;
  onSetReservation:        (tableId: string, name: string, time: string) => void;
  onCancelReservation:     (tableId: string) => void;
}

type ViewMode = "floor" | "list";

// Stalls that support table management
const TABLE_STALL_TYPES = ["TEAHOUSE", "CAFE"];

export default function OrdersTab({
  stalls, tables, orders, products, employees,
  selectedOrderStallId, onSelectOrderStall,
  activeOrderId, onSetActiveOrder,
  onOpenTable, onAddItemToOrder, onRemoveItemFromOrder,
  onUpdateOrderStatus, onPayOrder,
  onSetReservation, onCancelReservation,
}: OrdersTabProps) {
  const [viewMode,    setViewMode]    = useState<ViewMode>("floor");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");

  const selectedStall = stalls.find((s) => s.id === selectedOrderStallId);
  const hasFloor      = TABLE_STALL_TYPES.includes(selectedStall?.type ?? "");

  // Orders for selected stall
  const stallOrders = orders.filter((o) => o.stallId === selectedOrderStallId);
  const filteredOrders = filterStatus === "ALL"
    ? stallOrders
    : stallOrders.filter((o) => o.status === filterStatus);

  // Active order detail
  const activeOrder = orders.find((o) => o.id === activeOrderId) ?? null;

  // Stats
  const newCount       = orders.filter((o) => o.status === "NEW").length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount     = orders.filter((o) => o.status === "READY").length;
  const paidToday      = orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.totalAmount, 0);

  // Stalls that have orders module (teahouse, cafe, fastfood)
  const orderStalls = stalls.filter((s) =>
    s.status === "ACTIVE" &&
    ["TEAHOUSE", "CAFE", "FASTFOOD"].includes(s.type)
  );

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <AlertCircle className="w-4 h-4" />, label: "Yangi buyurtma",  value: newCount,       color: "text-blue-600",    bg: "bg-blue-50 border-blue-100"    },
          { icon: <Clock       className="w-4 h-4" />, label: "Tayyorlanmoqda",  value: preparingCount, color: "text-amber-600",   bg: "bg-amber-50 border-amber-100"  },
          { icon: <CheckCircle2 className="w-4 h-4"/>, label: "Tayyor",          value: readyCount,     color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { icon: <ShoppingBag  className="w-4 h-4"/>, label: "Bugungi tushum",  value: formatNumber(paidToday) + " so'm", color: "text-[#1e3d1f]", bg: "bg-[#eef7ef] border-[#b8d9ba]" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${s.bg}`}>
            <div className={`${s.color} shrink-0`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] font-[700] text-[#637063] uppercase tracking-wide">{s.label}</p>
              <p className={`text-base font-[800] ${s.color} font-mono leading-tight`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stall selector ── */}
      <div className="flex flex-wrap gap-2">
        {orderStalls.map((st) => {
          const meta    = STALL_TYPE_META[st.type];
          const pending = orders.filter((o) => o.stallId === st.id && o.status !== "PAID" && o.status !== "CANCELLED").length;
          return (
            <button
              key={st.id}
              onClick={() => { onSelectOrderStall(st.id); onSetActiveOrder(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-[700] transition-all
                ${selectedOrderStallId === st.id
                  ? "bg-[#1e3d1f] border-[#1e3d1f] text-white shadow-sm"
                  : "bg-white border-[#dedad3] text-[#637063] hover:border-[#4d8751]"
                }`}
            >
              <span>{meta.emoji}</span>
              <span>{st.name}</span>
              {pending > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-[800] flex items-center justify-center
                  ${selectedOrderStallId === st.id ? "bg-white text-[#1e3d1f]" : "bg-[#1e3d1f] text-white"}`}>
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── View mode + filter toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* View toggle */}
        {hasFloor && (
          <div className="flex items-center gap-1 p-1 bg-[#f0ede8] rounded-xl border border-[#dedad3]">
            <button onClick={() => setViewMode("floor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${viewMode === "floor" ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]" : "text-[#637063]"}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Stol rejasi
            </button>
            <button onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[700] transition-all
                ${viewMode === "list" ? "bg-white text-[#1e3d1f] shadow-sm border border-[#dedad3]" : "text-[#637063]"}`}>
              <List className="w-3.5 h-3.5" /> Ro'yxat
            </button>
          </div>
        )}

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {(["ALL","NEW","CONFIRMED","PREPARING","READY","SERVED","BILL_REQUESTED","PAID","CANCELLED"] as (OrderStatus|"ALL")[]).map((st) => {
            const count = st === "ALL" ? stallOrders.length : stallOrders.filter((o) => o.status === st).length;
            if (count === 0 && st !== "ALL") return null;
            return (
              <button key={st} onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-[700] border transition-all
                  ${filterStatus === st ? "bg-[#1e3d1f] text-white border-[#1e3d1f]" : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"}`}>
                {st === "ALL" ? "Barchasi" : st === "NEW" ? "Yangi" : st === "CONFIRMED" ? "Tasdiqlandi"
                  : st === "PREPARING" ? "Tayyorlanmoqda" : st === "READY" ? "Tayyor"
                  : st === "SERVED" ? "Yetkazildi" : st === "BILL_REQUESTED" ? "Hisob"
                  : st === "PAID" ? "To'landi" : "Bekor"}
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={`${activeOrder ? "grid grid-cols-1 lg:grid-cols-12 gap-5" : ""}`}>

        {/* Left: floor plan or list */}
        <div className={activeOrder ? "lg:col-span-7 space-y-4" : "space-y-4"}>

          {selectedStall && hasFloor && viewMode === "floor" && (
            <FloorPlan
              tables={tables}
              stall={selectedStall}
              orders={orders}
              employees={employees}
              onOpenTable={onOpenTable}
              onSelectOrder={(orderId) => onSetActiveOrder(orderId)}
              onSetReservation={onSetReservation}
              onCancelReservation={onCancelReservation}
            />
          )}

          {/* Order cards */}
          {(viewMode === "list" || !hasFloor) && (
            <div>
              {filteredOrders.length === 0 ? (
                <div className="card p-12 flex flex-col items-center gap-3 text-[#9daa9e]">
                  <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
                  <p className="text-sm font-[600]">
                    {filterStatus === "ALL" ? "Hozircha buyurtma yo'q" : "Bu statusda buyurtma topilmadi"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isActive={activeOrderId === order.id}
                        onSelect={() => onSetActiveOrder(activeOrderId === order.id ? null : order.id)}
                        onStatusChange={(status) => onUpdateOrderStatus(order.id, status)}
                        onPay={(method) => onPayOrder(order.id, method)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Floor view: active orders below */}
          {hasFloor && viewMode === "floor" && stallOrders.filter((o) => o.status !== "PAID" && o.status !== "CANCELLED").length > 0 && (
            <div>
              <p className="section-label mb-3">Faol buyurtmalar</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {stallOrders
                    .filter((o) => o.status !== "PAID" && o.status !== "CANCELLED")
                    .map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isActive={activeOrderId === order.id}
                        onSelect={() => onSetActiveOrder(activeOrderId === order.id ? null : order.id)}
                        onStatusChange={(status) => onUpdateOrderStatus(order.id, status)}
                        onPay={(method) => onPayOrder(order.id, method)}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Right: order detail panel */}
        {activeOrder && (
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <OrderPanel
                order={activeOrder}
                products={products}
                onAddItem={onAddItemToOrder}
                onRemoveItem={onRemoveItemFromOrder}
                onStatusChange={onUpdateOrderStatus}
                onPay={onPayOrder}
                onClose={() => onSetActiveOrder(null)}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

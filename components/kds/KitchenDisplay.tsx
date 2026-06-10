"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChefHat, Clock, CheckCircle2, AlertTriangle,
  Flame, Zap, Bell, Printer, QrCode,
} from "lucide-react";
import type { Order, OrderItem, OrderStatus, Stall } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";
import { formatNumber } from "../utils";
import OrderSlip from "../orders/OrderSlip";

interface KitchenDisplayProps {
  orders:              Order[];
  stalls:              Stall[];
  onUpdateItemStatus:  (orderId: string, itemId: string, status: OrderItem["status"]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const KITCHEN_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "READY"];
const URGENCY_THRESHOLD = 15; // minutes

function elapsed(t: string): number {
  try {
    const [h, m] = t.split(":").map(Number);
    const now    = new Date();
    return Math.max(0, (now.getHours() * 60 + now.getMinutes()) - (h * 60 + m));
  } catch { return 0; }
}

export default function KitchenDisplay({
  orders, stalls, onUpdateItemStatus, onUpdateOrderStatus,
}: KitchenDisplayProps) {
  const [, setTick]        = useState(0);
  const [filterStall,  setFilterStall]  = useState("ALL");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [slipOrder,    setSlipOrder]    = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(iv);
  }, []);

  const kitchenOrders = orders
    .filter((o) => KITCHEN_STATUSES.includes(o.status))
    .filter((o) => filterStall  === "ALL" || o.stallId === filterStall)
    .filter((o) => filterStatus === "ALL" || o.status  === filterStatus)
    .sort((a, b) => {
      const p: Record<string, number> = { CONFIRMED: 0, PREPARING: 1, READY: 2 };
      const sp = (p[a.status] ?? 3) - (p[b.status] ?? 3);
      return sp !== 0 ? sp : a.createdAt.localeCompare(b.createdAt);
    });

  const stallsWithKitchen = stalls.filter((s) =>
    ["FASTFOOD", "TEAHOUSE", "CAFE"].includes(s.type) && s.status === "ACTIVE"
  );

  const newCount     = orders.filter((o) => o.status === "CONFIRMED").length;
  const cookCount    = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount   = orders.filter((o) => o.status === "READY").length;
  const urgentCount  = kitchenOrders.filter((o) => elapsed(o.createdAt) >= URGENCY_THRESHOLD).length;
  // QR orders count
  const qrCount      = kitchenOrders.filter((o) => (o as any).source === "GUEST_QR").length;

  return (
    <div className="space-y-5">

      {/* ── KDS Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                      p-4 rounded-2xl border border-[#1e3d1f]/20"
           style={{ background: "linear-gradient(135deg, #0a1a0b 0%, #162d17 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e3d1f] border border-[#2d5230] flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-[#91c494]" />
          </div>
          <div>
            <h2 className="text-base font-[800] text-white">Kitchen Display System</h2>
            <p className="text-[11px] text-slate-400">Real-vaqt oshpazxona buyurtma boshqaruvi</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Yangi",          count: newCount,    cls: "bg-blue-500/20 text-blue-300 border-blue-500/30"     },
            { label: "Tayyorlanmoqda", count: cookCount,   cls: "bg-amber-500/20 text-amber-300 border-amber-500/30"  },
            { label: "Tayyor",         count: readyCount,  cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
            ...(qrCount > 0    ? [{ label: "📱 QR menyu", count: qrCount,    cls: "bg-violet-500/20 text-violet-300 border-violet-500/30" }] : []),
            ...(urgentCount > 0? [{ label: "🔥 Shoshilinch", count: urgentCount, cls: "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse" }] : []),
          ].map((s) => (
            <div key={s.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-[700] ${s.cls}`}>
              <span className="text-base font-[800]">{s.count}</span>
              <span>{s.label}</span>
            </div>
          ))}
          <button onClick={() => setSoundEnabled((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-[700] transition-all
              ${soundEnabled ? "bg-[#1e3d1f] text-[#91c494] border-[#2d5230]" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
            <Bell className="w-3.5 h-3.5" />
            {soundEnabled ? "Ovoz yoq" : "Ovoz o'ch"}
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterStall("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-[700] border transition-all
              ${filterStall === "ALL" ? "bg-[#1e3d1f] text-white border-[#1e3d1f]" : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"}`}>
            Barcha ({kitchenOrders.length})
          </button>
          {stallsWithKitchen.map((st) => {
            const cnt = orders.filter((o) => o.stallId === st.id && KITCHEN_STATUSES.includes(o.status)).length;
            return (
              <button key={st.id} onClick={() => setFilterStall(st.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-[700] border transition-all
                  ${filterStall === st.id ? "bg-[#1e3d1f] text-white border-[#1e3d1f]" : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"}`}>
                {st.name}
                {cnt > 0 && <span className="ml-1.5 bg-amber-500 text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[9px] font-[800]">{cnt}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {(["ALL", "CONFIRMED", "PREPARING", "READY"] as const).map((st) => (
            <button key={st} onClick={() => setFilterStatus(st as OrderStatus | "ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-[700] border transition-all
                ${filterStatus === st ? "bg-[#1e3d1f] text-white border-[#1e3d1f]" : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"}`}>
              {st === "ALL" ? "Hammasi" : st === "CONFIRMED" ? "Yangi" : st === "PREPARING" ? "Pishmoqda" : "Tayyor"}
            </button>
          ))}
        </div>
      </div>

      {/* ── KDS Cards ── */}
      {kitchenOrders.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-[#9daa9e]">
          <ChefHat className="w-14 h-14 stroke-[1]" />
          <p className="text-base font-[700]">Oshpazxona bo'sh</p>
          <p className="text-sm text-[#c4ccc4]">Hozircha buyurtma yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {kitchenOrders.map((order) => (
              <KdsCard
                key={order.id}
                order={order}
                elapsed={elapsed(order.createdAt)}
                onUpdateItemStatus={onUpdateItemStatus}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onPrintSlip={() => setSlipOrder(order)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Kitchen slip modal ── */}
      {slipOrder && (
        <OrderSlip
          order={slipOrder}
          type="kitchen"
          onClose={() => setSlipOrder(null)}
        />
      )}
    </div>
  );
}

// ── KdsCard ───────────────────────────────────────────────────
interface KdsCardProps {
  order:               Order;
  elapsed:             number;
  onUpdateItemStatus:  (orderId: string, itemId: string, status: OrderItem["status"]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onPrintSlip:         () => void;
}

function KdsCard({
  order, elapsed, onUpdateItemStatus, onUpdateOrderStatus, onPrintSlip,
}: KdsCardProps) {
  const isUrgent   = elapsed >= URGENCY_THRESHOLD;
  const isVeryLate = elapsed >= 25;
  const readyItems = order.items.filter((i) => i.status === "READY");
  const allReady   = order.items.length > 0 && readyItems.length === order.items.length;
  const isQR       = (order as any).source === "GUEST_QR";

  return (
    <motion.div layout
      initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: .92 }} transition={{ duration: .2 }}
      className={`overflow-hidden rounded-2xl border-2 flex flex-col
        ${isVeryLate    ? "border-red-400 shadow-lg shadow-red-100"
          : isUrgent    ? "border-amber-400 shadow-lg shadow-amber-50"
          : order.status === "READY"     ? "border-emerald-400 shadow-lg shadow-emerald-50"
          : "border-[#dedad3]"
        }`}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between gap-2
        ${isVeryLate    ? "bg-red-500"
          : isUrgent    ? "bg-amber-500"
          : order.status === "READY"     ? "bg-emerald-600"
          : order.status === "PREPARING" ? "bg-[#2d5230]"
          : "bg-[#1e3d1f]"
        }`}>
        <div className="flex items-center gap-2 min-w-0">
          {isVeryLate   && <Flame className="w-4 h-4 text-white shrink-0 animate-bounce" />}
          {isUrgent && !isVeryLate && <Zap className="w-4 h-4 text-white shrink-0" />}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-[800] text-white leading-tight">
                {order.tableNumber ? `Stol #${order.tableNumber}` : order.type === "FASTFOOD" ? "Fast-food" : "Olib ketish"}
              </p>
              {/* QR badge */}
              {isQR && (
                <span className="flex items-center gap-0.5 bg-violet-500/30 border border-violet-400/30
                                 text-violet-200 text-[9px] font-[800] px-1.5 py-0.5 rounded-full">
                  <QrCode className="w-2.5 h-2.5" /> QR
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/70 truncate">{order.stallName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-[800] font-mono
            ${isVeryLate || isUrgent ? "bg-white/20 text-white" : "bg-black/20 text-white/80"}`}>
            <Clock className="w-3 h-3" />{elapsed}m
          </div>
          <button onClick={onPrintSlip}
            title="Oshpaz chekini chop etish"
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center
                       justify-center text-white transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#f0ede8]">
        <div className={`h-full transition-all duration-500 ${
          allReady ? "bg-emerald-500" : order.status === "PREPARING" ? "bg-amber-400" : "bg-[#4d8751]"
        }`} style={{ width: `${order.items.length > 0 ? (readyItems.length / order.items.length) * 100 : 0}%` }} />
      </div>

      {/* Items */}
      <div className="flex-1 p-4 space-y-2 bg-white">
        {order.items.map((item) => {
          const catMeta    = PRODUCT_CATEGORY_META[item.category];
          const isReady    = item.status === "READY" || item.status === "SERVED";
          const isPreparing = item.status === "PREPARING";
          return (
            <div key={item.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
                ${isReady      ? "bg-emerald-50 border-emerald-100 opacity-70"
                  : isPreparing ? "bg-amber-50 border-amber-100"
                  : "bg-[#f7f5f2] border-[#f0ede8]"
                }`}>
              <span className="text-lg shrink-0">{catMeta.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-[700] leading-tight
                  ${isReady ? "text-[#9daa9e] line-through" : "text-[#1e3d1f]"}`}>
                  {item.productName}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-[700] text-[#637063]">×{item.quantity}</span>
                  {item.note && <span className="text-[10px] text-amber-700 italic font-[600]">⚠ "{item.note}"</span>}
                  {item.prepTime != null && item.prepTime > 0 && (
                    <span className="text-[10px] text-[#9daa9e]">⏱ {item.prepTime}m</span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                {item.status === "PENDING" && (
                  <button onClick={() => onUpdateItemStatus(order.id, item.id, "PREPARING")}
                    className="text-[9px] font-[700] px-2 py-1 rounded-lg bg-amber-100 text-amber-700
                               border border-amber-200 hover:bg-amber-200 transition-all">
                    Boshlash
                  </button>
                )}
                {item.status === "PREPARING" && (
                  <button onClick={() => onUpdateItemStatus(order.id, item.id, "READY")}
                    className="text-[9px] font-[700] px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700
                               border border-emerald-200 hover:bg-emerald-200 transition-all">
                    ✓ Tayyor
                  </button>
                )}
                {isReady && (
                  <span className="text-[9px] font-[700] px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600">
                    ✓ Tayyor
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#f0ede8] bg-[#f7f5f2] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-[#637063]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-[700]">{readyItems.length}/{order.items.length} tayyor</span>
          {order.waiterName && <span className="text-[#9daa9e]">· {order.waiterName}</span>}
        </div>
        <div className="flex gap-1.5">
          {order.status === "CONFIRMED" && (
            <button onClick={() => onUpdateOrderStatus(order.id, "PREPARING")}
              className="btn btn-primary btn-sm">
              <ChefHat className="w-3.5 h-3.5" /> Boshlash
            </button>
          )}
          {order.status === "PREPARING" && allReady && (
            <button onClick={() => onUpdateOrderStatus(order.id, "READY")}
              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0">
              <Bell className="w-3.5 h-3.5" /> Tayyor!
            </button>
          )}
          {order.status === "READY" && (
            <button onClick={() => onUpdateOrderStatus(order.id, "SERVED")}
              className="btn btn-sm bg-[#4d8751] hover:bg-[#1e3d1f] text-white border-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yetkazildi
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

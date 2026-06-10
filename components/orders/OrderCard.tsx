"use client";

import { useState } from "react";
import { Clock, Users, ChefHat, CheckCircle2, XCircle, Printer, QrCode, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import type { Order, OrderStatus, PaymentMethod } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";
import { formatNumber } from "../utils";
import OrderSlip from "./OrderSlip";

interface OrderCardProps {
  order:          Order;
  isActive:       boolean;
  onSelect:       () => void;
  onStatusChange: (status: OrderStatus) => void;
  onPay:          (method: PaymentMethod) => void;
}

const STATUS_META: Record<OrderStatus, {
  label: string; color: string; bg: string;
  next?: OrderStatus; nextLabel?: string;
}> = {
  NEW:            { label: "Yangi",           color: "text-blue-700",    bg: "bg-blue-100 border-blue-200",     next: "CONFIRMED",      nextLabel: "Tasdiqlash"            },
  CONFIRMED:      { label: "Tasdiqlandi",      color: "text-indigo-700",  bg: "bg-indigo-100 border-indigo-200", next: "PREPARING",      nextLabel: "Oshpazga yuborish"     },
  PREPARING:      { label: "Tayyorlanmoqda",   color: "text-amber-700",   bg: "bg-amber-100 border-amber-200",   next: "READY",          nextLabel: "Tayyor deb belgilash"  },
  READY:          { label: "Tayyor",           color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200",next: "SERVED",        nextLabel: "Yetkazildi"            },
  SERVED:         { label: "Yetkazildi",       color: "text-[#1e3d1f]",   bg: "bg-[#eef7ef] border-[#b8d9ba]",  next: "BILL_REQUESTED", nextLabel: "Hisob so'rash"         },
  BILL_REQUESTED: { label: "Hisob kutilmoqda", color: "text-purple-700",  bg: "bg-purple-100 border-purple-200" },
  PAID:           { label: "To'landi",         color: "text-slate-600",   bg: "bg-slate-100 border-slate-200"   },
  CANCELLED:      { label: "Bekor qilindi",    color: "text-red-600",     bg: "bg-red-100 border-red-200"       },
};

const ORDER_TYPE_META = {
  DINE_IN:  { label: "Stol buyurtmasi", emoji: "🪑" },
  TAKEAWAY: { label: "Olib ketish",     emoji: "🥡" },
  FASTFOOD: { label: "Fast-food",       emoji: "🍔" },
};

export default function OrderCard({
  order, isActive, onSelect, onStatusChange, onPay,
}: OrderCardProps) {
  const [slipType, setSlipType] = useState<"kitchen" | "waiter" | null>(null);

  const meta      = STATUS_META[order.status];
  const typeMeta  = ORDER_TYPE_META[order.type];
  const isQR      = (order as any).source === "GUEST_QR";
  const canAdvance = !!meta.next && order.status !== "PAID" && order.status !== "CANCELLED";
  const canPay     = order.status === "BILL_REQUESTED" || order.status === "SERVED";
  const canCancel  = order.status === "NEW" || order.status === "CONFIRMED";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: .96 }}
        onClick={onSelect}
        className={`card cursor-pointer overflow-hidden transition-all
          ${isActive ? "ring-2 ring-[#4d8751] shadow-md" : "hover:shadow-sm"}
          ${order.status === "PAID" || order.status === "CANCELLED" ? "opacity-60" : ""}
          ${isQR ? "ring-1 ring-violet-300" : ""}
        `}
      >
        {/* Status bar */}
        <div className={`h-1.5 w-full ${
          order.status === "NEW"             ? "bg-blue-400"
          : order.status === "CONFIRMED"    ? "bg-indigo-400"
          : order.status === "PREPARING"    ? "bg-amber-400"
          : order.status === "READY"        ? "bg-emerald-400"
          : order.status === "SERVED"       ? "bg-[#4d8751]"
          : order.status === "BILL_REQUESTED" ? "bg-purple-400"
          : order.status === "PAID"         ? "bg-slate-300"
          : "bg-red-300"
        }`} />

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base">{typeMeta.emoji}</span>
                <p className="text-xs font-[800] text-[#1e3d1f]">
                  {order.tableNumber ? `Stol #${order.tableNumber}` : typeMeta.label}
                </p>
                <span className={`badge border text-[10px] ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
                {/* QR source badge */}
                {isQR && (
                  <span className="flex items-center gap-0.5 badge text-[9px]
                                   bg-violet-100 text-violet-700 border-violet-200">
                    <QrCode className="w-2.5 h-2.5" /> QR menyu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#637063] mt-0.5">{order.stallName}</p>
              {/* Guest name if QR */}
              {isQR && (order as any).guestName && (
                <p className="text-[10px] text-violet-600 font-[700] mt-0.5">
                  👤 {(order as any).guestName}
                </p>
              )}
            </div>
            <p className="text-sm font-[800] text-[#1e3d1f] font-mono shrink-0">
              {formatNumber(order.totalAmount)}
              <span className="text-[10px] font-[600] text-[#637063] ml-0.5">so'm</span>
            </p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#637063]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-mono font-[700]">{order.createdAt}</span>
            </span>
            {order.guestCount && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />{order.guestCount} mehmon
              </span>
            )}
            {order.waiterName && (
              <span className="text-[#4d8751] font-[600]">{order.waiterName}</span>
            )}
          </div>

          {/* Items */}
          <div className="space-y-1">
            {order.items.slice(0, 3).map((item) => {
              const catMeta = PRODUCT_CATEGORY_META[item.category];
              return (
                <div key={item.id} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#283028] min-w-0">
                    <span className="text-[13px] shrink-0">{catMeta.emoji}</span>
                    <span className="truncate font-[500]">{item.productName}</span>
                    <span className="text-[#9daa9e] shrink-0">×{item.quantity}</span>
                  </span>
                  <span className={`shrink-0 ml-2 text-[10px] font-[700] px-1.5 py-0.5 rounded-full ${
                    item.status === "READY"       ? "bg-emerald-100 text-emerald-700"
                    : item.status === "SERVED"    ? "bg-slate-100 text-slate-500"
                    : item.status === "PREPARING" ? "bg-amber-100 text-amber-700"
                    : "bg-blue-50 text-blue-500"
                  }`}>
                    {item.status === "READY" ? "✓" : item.status === "SERVED" ? "✓" : item.status === "PREPARING" ? "⏱" : "⏳"}
                  </span>
                </div>
              );
            })}
            {order.items.length > 3 && (
              <p className="text-[10px] text-[#9daa9e]">+{order.items.length - 3} ta boshqa</p>
            )}
          </div>

          {/* Active actions */}
          {isActive && order.status !== "PAID" && order.status !== "CANCELLED" && (
            <div className="border-t border-[#f0ede8] pt-3 space-y-2"
                 onClick={(e) => e.stopPropagation()}>

              {/* Slip print buttons */}
              <div className="flex gap-2">
                <button onClick={() => setSlipType("kitchen")}
                  className="btn btn-secondary btn-sm flex-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                  <Printer className="w-3.5 h-3.5" /> Oshpaz cheki
                </button>
                <button onClick={() => setSlipType("waiter")}
                  className="btn btn-secondary btn-sm flex-1 text-[#4d8751] border-[#b8d9ba] hover:bg-[#eef7ef]">
                  <Printer className="w-3.5 h-3.5" /> Ofitsiant cheki
                </button>
              </div>

              {/* Advance */}
              {canAdvance && (
                <button onClick={() => meta.next && onStatusChange(meta.next)}
                  className="btn btn-primary btn-full btn-sm">
                  <ChefHat className="w-3.5 h-3.5" /> {meta.nextLabel}
                </button>
              )}

              {/* Payment */}
              {canPay && (
                <div className="space-y-1.5">
                  <p className="section-label">To'lov usuli</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["CASH", "CARD", "MOBILE"] as PaymentMethod[]).map((m) => (
                      <button key={m} onClick={() => onPay(m)}
                        className={`py-2 rounded-xl text-[10px] font-[700] border-2 transition-all
                          ${m === "CASH"   ? "border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-emerald-700"
                            : m === "CARD" ? "border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-blue-700"
                            : "border-violet-200 hover:bg-violet-500 hover:text-white hover:border-violet-500 text-violet-700"
                          }`}>
                        {m === "CASH" ? "Naqd" : m === "CARD" ? "Karta" : "Click"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel */}
              {canCancel && (
                <button onClick={() => onStatusChange("CANCELLED")}
                  className="btn btn-danger btn-full btn-sm">
                  <XCircle className="w-3.5 h-3.5" /> Bekor qilish
                </button>
              )}
            </div>
          )}

          {/* Paid */}
          {order.status === "PAID" && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-[700]
                            border-t border-[#f0ede8] pt-2">
              <CheckCircle2 className="w-4 h-4" />
              To'landi · {order.paidAt}
            </div>
          )}
        </div>
      </motion.div>

      {/* Slip modals */}
      {slipType && (
        <OrderSlip
          order={order}
          type={slipType}
          onClose={() => setSlipType(null)}
        />
      )}
    </>
  );
}

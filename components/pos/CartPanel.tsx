"use client";

import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, CheckCircle2 } from "lucide-react";
import { formatNumber } from "../utils";
import type { CartItem, PaymentMethod } from "../types";

interface CartPanelProps {
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  isOnline: boolean;
  syncQueueLength: number;
  onUpdateQty: (productId: string, delta: number) => void;
  onSetPayment: (m: PaymentMethod) => void;
  onCheckout: () => void;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "CASH",   label: "Naqd",         icon: <Banknote    className="w-4 h-4" /> },
  { id: "CARD",   label: "Terminal",     icon: <CreditCard  className="w-4 h-4" /> },
  { id: "MOBILE", label: "Click/Payme",  icon: <Smartphone  className="w-4 h-4" /> },
];

export default function CartPanel({
  cart, paymentMethod, isOnline, syncQueueLength,
  onUpdateQty, onSetPayment, onCheckout,
}: CartPanelProps) {
  const total     = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="card flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8]">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#4d8751]" />
          <span className="text-sm font-[700] text-[#1e3d1f]">Savat</span>
        </div>
        {itemCount > 0 && (
          <span className="w-6 h-6 rounded-full bg-[#1e3d1f] text-white text-[11px] font-[800] flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>

      {/* ── Items ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[180px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 py-10 text-[#c4ccc4]">
            <ShoppingCart className="w-10 h-10 stroke-[1.2]" />
            <p className="text-xs font-[600] text-[#9daa9e]">Savat bo'sh</p>
            <p className="text-[11px] text-[#c4ccc4] text-center max-w-[160px]">
              Chap tomondagi mahsulotlardan birini tanlang
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f5f2] border border-[#f0ede8] group"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-[700] text-[#1e3d1f] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-[#637063] font-[600] mt-0.5">
                    {formatNumber(item.product.price)} so'm × {item.quantity}
                    <span className="text-[#1e3d1f] font-[700] ml-1">
                      = {formatNumber(item.product.price * item.quantity)} so'm
                    </span>
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.product.id, -1)}
                    className="btn-icon btn-icon-sm"
                  >
                    {item.quantity === 1
                      ? <Trash2 className="w-3 h-3 text-red-400" />
                      : <Minus className="w-3 h-3" />
                    }
                  </button>
                  <span className="w-6 text-center text-xs font-[800] text-[#1e3d1f] font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, 1)}
                    className="btn-icon btn-icon-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#f0ede8] px-5 py-4 space-y-4">

        {/* Payment method */}
        <div>
          <p className="section-label mb-2">To'lov turi</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSetPayment(opt.id)}
                className={`
                  flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2
                  text-[10px] font-[700] transition-all duration-150
                  ${paymentMethod === opt.id
                    ? "bg-[#1e3d1f] border-[#1e3d1f] text-white shadow-sm"
                    : "bg-[#f7f5f2] border-[#dedad3] text-[#637063] hover:border-[#4d8751] hover:text-[#1e3d1f]"
                  }
                `}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price summary */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-[#637063] font-[600]">
            <span>Jami ({itemCount} mahsulot)</span>
            <span>{formatNumber(total)} so'm</span>
          </div>
          <div className="flex justify-between text-[#637063] font-[600]">
            <span>QQS (0%)</span>
            <span>0 so'm</span>
          </div>
          <div className="flex justify-between font-[800] text-[#1e3d1f] text-sm pt-2 border-t border-[#f0ede8]">
            <span>Yakuniy hisob</span>
            <span>{formatNumber(total)} so'm</span>
          </div>
        </div>

        {/* Checkout button */}
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="btn btn-primary btn-full btn-lg"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isOnline
            ? "Sotuvni qabul qilish"
            : `Offline saqlash (navbat: ${syncQueueLength})`
          }
        </button>

      </div>
    </div>
  );
}

"use client";

import { ShoppingCart, Plus, Minus, CheckCircle2 } from "lucide-react";
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

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH:   "Naqd",
  CARD:   "Terminal",
  MOBILE: "Click / Payme",
};

export default function CartPanel({
  cart,
  paymentMethod,
  isOnline,
  syncQueueLength,
  onUpdateQty,
  onSetPayment,
  onCheckout,
}: CartPanelProps) {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#DAD7CD] shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F2F4EF] pb-4 mb-4">
        <h3 className="text-xs uppercase tracking-wider font-bold text-[#2D452E] flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-[#3A5A40]" />
          POS Kassa Savati
        </h3>
        <span className="bg-[#A3B18A]/20 text-[#2D452E] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#DAD7CD]">
          {itemCount} element
        </span>
      </div>

      {/* Cart items */}
      <div className="flex-1 min-h-[180px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-[#588157] gap-2">
            <ShoppingCart className="h-10 w-10 text-[#A3B18A] stroke-[1.5]" />
            <p className="text-xs">Savat bo'sh. Chap tomondan mahsulot tanlang.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-[#F2F4EF]/60 p-3 rounded-xl flex items-center justify-between gap-2 border border-[#DAD7CD]"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#2D3A2D] truncate">{item.product.name}</h4>
                  <p className="text-[10px] text-[#588157] mt-0.5 font-semibold">
                    {formatNumber(item.product.price)} so'm × {item.quantity} ={" "}
                    <span className="text-[#2D452E] font-bold">
                      {formatNumber(item.product.price * item.quantity)} so'm
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.product.id, -1)}
                    className="h-6 w-6 bg-[#DAD7CD]/60 hover:bg-[#DAD7CD] rounded-lg flex items-center justify-center text-[#2D452E] transition-all active:scale-90"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold font-mono text-[#2D452E] w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, 1)}
                    className="h-6 w-6 bg-[#DAD7CD]/60 hover:bg-[#DAD7CD] rounded-lg flex items-center justify-center text-[#2D452E] transition-all active:scale-90"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: payment + summary + checkout */}
      <div className="border-t border-[#F2F4EF] pt-4 mt-4 space-y-4">
        {/* Payment method */}
        <div>
          <span className="text-[10px] text-[#588157] block mb-2 font-bold uppercase tracking-wider">
            To'lov Turi:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(["CASH", "CARD", "MOBILE"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => onSetPayment(m)}
                className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                  paymentMethod === m
                    ? "bg-[#2D452E] border-[#2D452E] text-white shadow-sm"
                    : "bg-[#F2F4EF]/50 border-[#DAD7CD] text-[#588157] hover:border-[#588157]"
                }`}
              >
                {PAYMENT_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-[#588157]">
            <span>Aylanish summasi:</span>
            <span className="font-semibold">{formatNumber(total)} so'm</span>
          </div>
          <div className="flex justify-between text-[#588157]">
            <span>QQS (0%):</span>
            <span className="font-semibold">0 so'm</span>
          </div>
          <div className="flex justify-between font-bold text-[#2D452E] pt-2 border-t border-[#F2F4EF] text-sm">
            <span>Yakuniy Hisob:</span>
            <span>{formatNumber(total)} so'm</span>
          </div>
        </div>

        {/* Checkout button */}
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            cart.length === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : "bg-[#2D452E] hover:bg-[#3A5A40] text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isOnline
            ? "Sotuvni Qabul Qilish (Sync)"
            : `Sotuv — Offline saqlash (${syncQueueLength} navbatda)`}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Minus, Trash2, Search, ChefHat, X, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Order, Product, OrderItem, OrderStatus, PaymentMethod } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";
import { formatNumber, getUniqueId } from "../utils";

interface OrderPanelProps {
  order: Order;
  products: Product[];
  onAddItem: (orderId: string, product: Product, qty: number, note?: string) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onPay: (orderId: string, method: PaymentMethod) => void;
  onClose: () => void;
}

const STATUS_FLOW: OrderStatus[] = ["NEW", "CONFIRMED", "PREPARING", "READY", "SERVED", "BILL_REQUESTED", "PAID"];

const ITEM_STATUS_META: Record<OrderItem["status"], { label: string; cls: string }> = {
  PENDING:   { label: "Navbatda",      cls: "bg-blue-50 text-blue-600 border-blue-100"    },
  PREPARING: { label: "Tayyorlanmoqda", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  READY:     { label: "Tayyor",         cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  SERVED:    { label: "Berildi",        cls: "bg-slate-50 text-slate-500 border-slate-100" },
};

export default function OrderPanel({
  order, products, onAddItem, onRemoveItem, onStatusChange, onPay, onClose,
}: OrderPanelProps) {
  const [search,    setSearch]    = useState("");
  const [noteMap,   setNoteMap]   = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"order" | "menu">("order");

  const stallProducts = products.filter(
    (p) => p.stallId === order.stallId && p.isAvailable
  );

  const filtered = search.trim()
    ? stallProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : stallProducts;

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);
  const canEdit = order.status !== "PAID" && order.status !== "CANCELLED";

  const handleAddWithNote = (product: Product) => {
    const note = noteMap[product.id] || undefined;
    onAddItem(order.id, product, 1, note);
    setNoteMap((prev) => ({ ...prev, [product.id]: "" }));
  };

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ede8] bg-[#f7f5f2]">
        <div>
          <h3 className="text-sm font-[800] text-[#1e3d1f]">
            {order.tableNumber ? `Stol #${order.tableNumber}` : order.type === "FASTFOOD" ? "Fast-food buyurtma" : "Olib ketish"}
          </h3>
          <p className="text-[11px] text-[#637063]">{order.stallName} · {order.createdAt} · {order.id}</p>
        </div>
        <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
      </div>

      {/* ── Status pipeline ── */}
      <div className="px-5 py-3 border-b border-[#f0ede8] overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STATUS_FLOW.slice(0, -1).map((st, i) => {
            const isDone    = i < currentStatusIdx;
            const isCurrent = i === currentStatusIdx;
            return (
              <div key={st} className="flex items-center gap-1">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-[700] whitespace-nowrap border transition-all
                  ${isCurrent ? "bg-[#1e3d1f] text-white border-[#1e3d1f]"
                    : isDone  ? "bg-[#eef7ef] text-[#4d8751] border-[#b8d9ba]"
                    : "bg-[#f7f5f2] text-[#c4ccc4] border-[#f0ede8]"
                  }`}>
                  {isDone && "✓ "}
                  {st === "NEW" ? "Yangi" : st === "CONFIRMED" ? "Tasdiqlandi" : st === "PREPARING" ? "Tayyorlanmoqda" : st === "READY" ? "Tayyor" : st === "SERVED" ? "Yetkazildi" : "Hisob"}
                </div>
                {i < STATUS_FLOW.length - 2 && <span className="text-[#c4ccc4] font-bold text-xs">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex border-b border-[#f0ede8]">
        {[
          { id: "order" as const, label: `Buyurtma (${order.items.length})` },
          { id: "menu"  as const, label: "Menyu qo'shish" },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-[700] border-b-2 transition-all
              ${activeTab === t.id
                ? "border-[#1e3d1f] text-[#1e3d1f]"
                : "border-transparent text-[#637063] hover:text-[#1e3d1f]"
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Order items tab */}
        {activeTab === "order" && (
          <div className="p-4 space-y-2">
            {order.items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-[#9daa9e]">
                <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
                <p className="text-sm font-[600]">Hali hech narsa yo'q</p>
                <button onClick={() => setActiveTab("menu")} className="btn btn-primary btn-sm">
                  <Plus className="w-3.5 h-3.5" /> Menyu qo'shish
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {order.items.map((item) => {
                  const itemMeta = ITEM_STATUS_META[item.status];
                  const catMeta  = PRODUCT_CATEGORY_META[item.category];
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f5f2] border border-[#f0ede8]"
                    >
                      <span className="text-xl shrink-0">{catMeta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-[700] text-[#1e3d1f] truncate">{item.productName}</p>
                          <span className={`badge border text-[9px] ${itemMeta.cls}`}>{itemMeta.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] text-[#637063]">
                            {formatNumber(item.price)} × {item.quantity} =
                            <span className="font-[700] text-[#1e3d1f] ml-1">{formatNumber(item.price * item.quantity)} so'm</span>
                          </p>
                          {item.note && (
                            <span className="text-[10px] text-amber-600 italic">"{item.note}"</span>
                          )}
                        </div>
                      </div>
                      {canEdit && item.status !== "SERVED" && (
                        <button onClick={() => onRemoveItem(order.id, item.id)}
                          className="btn-icon btn-icon-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Menu tab */}
        {activeTab === "menu" && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9daa9e]" />
              <input className="input pl-9" placeholder="Mahsulot qidiring..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="space-y-2">
              {filtered.map((p) => {
                const catMeta = PRODUCT_CATEGORY_META[p.category];
                const inOrder = order.items.find((i) => i.productId === p.id);
                return (
                  <div key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f5f2] border border-[#f0ede8]">
                    <span className="text-xl shrink-0">{catMeta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-[700] text-[#1e3d1f] truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] font-[700] text-[#4d8751] font-mono">{formatNumber(p.price)} so'm</p>
                        {p.prepTime ? <span className="text-[10px] text-[#9daa9e]">⏱ {p.prepTime} min</span> : null}
                        {inOrder && <span className="text-[10px] text-emerald-600 font-[700]">× {inOrder.quantity} savat</span>}
                      </div>
                      {/* Note input */}
                      <input
                        className="mt-1.5 w-full text-[10px] px-2 py-1 rounded-lg border border-[#f0ede8] bg-white placeholder-[#c4ccc4] focus:outline-none focus:border-[#4d8751]"
                        placeholder="Izoh (masalan: o'tkir qilmang)..."
                        value={noteMap[p.id] ?? ""}
                        onChange={(e) => setNoteMap((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={() => handleAddWithNote(p)}
                      disabled={!canEdit || p.stock <= 0}
                      className="btn btn-primary btn-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: total + actions ── */}
      <div className="border-t border-[#f0ede8] px-5 py-4 space-y-3 bg-[#f7f5f2]">
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-[700] text-[#637063]">Jami:</span>
          <span className="text-xl font-[800] text-[#1e3d1f] font-mono">
            {formatNumber(order.totalAmount)} so'm
          </span>
        </div>

        {/* Action buttons */}
        {canEdit && (
          <div className="space-y-2">
            {/* Advance */}
            {order.status !== "BILL_REQUESTED" && order.status !== "PAID" && (
              (() => {
                const nextMap: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
                  NEW:      { next: "CONFIRMED",      label: "Tasdiqlash" },
                  CONFIRMED:{ next: "PREPARING",      label: "Oshpazga yuborish" },
                  PREPARING:{ next: "READY",           label: "Tayyor belgilash" },
                  READY:    { next: "SERVED",          label: "Yetkazildi" },
                  SERVED:   { next: "BILL_REQUESTED",  label: "Hisob talab qilish" },
                };
                const action = nextMap[order.status];
                if (!action || order.items.length === 0) return null;
                return (
                  <button onClick={() => onStatusChange(order.id, action.next)}
                    className="btn btn-primary btn-full">
                    <ChefHat className="w-4 h-4" /> {action.label}
                  </button>
                );
              })()
            )}

            {/* Payment */}
            {(order.status === "BILL_REQUESTED" || order.status === "SERVED") && (
              <div className="space-y-1.5">
                <p className="section-label text-center">To'lov usulini tanlang</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "CARD", "MOBILE"] as PaymentMethod[]).map((m) => (
                    <button key={m} onClick={() => onPay(order.id, m)}
                      className={`py-2.5 rounded-xl text-xs font-[700] border-2 transition-all
                        ${m === "CASH"   ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                          : m === "CARD" ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                          : "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
                        }`}>
                      {m === "CASH" ? "💵 Naqd" : m === "CARD" ? "💳 Karta" : "📱 Click"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(order.status === "PAID") && (
          <div className="text-center py-2 text-emerald-600 text-sm font-[700]">
            ✅ Buyurtma to'landi · {order.paidAt}
          </div>
        )}
        {(order.status === "CANCELLED") && (
          <div className="text-center py-2 text-red-500 text-sm font-[700]">
            ❌ Bekor qilindi
          </div>
        )}
      </div>
    </div>
  );
}

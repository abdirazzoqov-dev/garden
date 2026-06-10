"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, Plus, Minus, Trash2, Send, CheckCircle2,
  Leaf, Clock, ChevronDown, Info, Loader2, AlertCircle,
} from "lucide-react";
import { INITIAL_STALLS, INITIAL_PRODUCTS, PRODUCT_CATEGORY_META, STALL_TYPE_META } from "../../../components/constants";
import type { Product, ProductCategory } from "../../../components/types";

// ── Guest cart item ────────────────────────────────────────────
interface GuestCartItem {
  product: Product;
  quantity: number;
  note: string;
}

// ── Format number ─────────────────────────────────────────────
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// ═══════════════════════════════════════════════════════════════
export default function GuestMenuPage() {
  const params       = useParams();
  const searchParams = useSearchParams();

  const stallId    = params.stallId as string;
  const tableNum   = searchParams.get("table");
  const tableLabel = tableNum ? `Stol #${tableNum}` : "Olib ketish";

  // ── Data ────────────────────────────────────────────────────
  const stall    = INITIAL_STALLS.find((s) => s.id === stallId);
  const products = INITIAL_PRODUCTS.filter((p) => p.stallId === stallId && p.isAvailable);

  // ── UI state ────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "ALL">("ALL");
  const [cart,           setCart]           = useState<GuestCartItem[]>([]);
  const [cartOpen,       setCartOpen]       = useState(false);
  const [noteMap,        setNoteMap]        = useState<Record<string, string>>({});
  const [guestName,      setGuestName]      = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [orderId,        setOrderId]        = useState<string | null>(null);

  // ── Category list from available products ──────────────────
  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))] as (ProductCategory | "ALL")[];

  const filtered = activeCategory === "ALL"
    ? products
    : products.filter((p) => p.category === activeCategory);

  // ── Cart helpers ────────────────────────────────────────────
  const totalItems  = cart.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, note: "" }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const next = item.quantity + delta;
          if (next <= 0) return null;
          return { ...item, quantity: next };
        })
        .filter(Boolean) as GuestCartItem[]
    );
  };

  const updateNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === productId ? { ...i, note } : i)
    );
  };

  // ── Submit order ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stallId,
          stallName: stall?.name,
          tableNumber: tableNum ? Number(tableNum) : null,
          guestName:   guestName.trim() || null,
          items: cart.map((i) => ({
            productId:   i.product.id,
            productName: i.product.name,
            category:    i.product.category,
            price:       i.product.price,
            quantity:    i.quantity,
            note:        i.note || null,
            prepTime:    i.product.prepTime ?? 0,
          })),
          totalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Buyurtma yuborishda xatolik");

      setOrderId(data.orderId);
      setSubmitted(true);
      setCart([]);
    } catch (e: any) {
      setError(e.message ?? "Server xatoligi");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not found ───────────────────────────────────────────────
  if (!stall) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-14 h-14 text-red-400" />
        <h1 className="text-xl font-[800] text-[#1e3d1f]">Rasta topilmadi</h1>
        <p className="text-[#637063] text-sm">QR kodni qaytadan skanerlang</p>
      </div>
    );
  }

  const stallMeta = STALL_TYPE_META[stall.type];

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6"
           style={{ background: "linear-gradient(135deg, #0a1a0b 0%, #162d17 100%)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400
                          flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-[800] text-white">Buyurtma qabul qilindi!</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tableNum ? `Stol #${tableNum}` : "Buyurtmangiz"} uchun buyurtma yuborildi.
              <br />Ofitsiant tez orada sizga keladi.
            </p>
            {orderId && (
              <p className="font-mono text-[11px] text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg">
                Buyurtma ID: {orderId.slice(-8)}
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="w-full max-w-xs bg-white/[.06] border border-white/10 rounded-2xl p-4 space-y-2.5">
            <p className="text-[11px] font-[700] text-slate-400 uppercase tracking-wider">
              Buyurtma tarkibi
            </p>
            {cart.length === 0 ? null : cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-white/80">
                  {item.product.name} ×{item.quantity}
                </span>
                <span className="text-emerald-400 font-mono">
                  {fmt(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setSubmitted(false); setOrderId(null); }}
            className="mt-2 px-6 py-3 rounded-xl bg-[#1e3d1f] border border-[#2d5230]
                       text-white font-[700] text-sm hover:bg-[#2d5230] transition-all"
          >
            Yana buyurtma berish
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main menu UI ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f5f2] pb-32">

      {/* ── Header ── */}
      <div className={`sticky top-0 z-30 text-white shadow-lg ${
        stall.type === "FASTFOOD"   ? "bg-gradient-to-r from-orange-700 to-amber-600"
        : stall.type === "TEAHOUSE" ? "bg-gradient-to-r from-emerald-800 to-teal-700"
        : stall.type === "CAFE"     ? "bg-gradient-to-r from-amber-700 to-yellow-600"
        : "bg-gradient-to-r from-[#1e3d1f] to-[#4d8751]"
      }`}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stallMeta.emoji}</span>
            <div>
              <h1 className="text-base font-[800] leading-tight">{stall.name}</h1>
              <p className="text-[11px] text-white/70 font-[500]">
                📍 {stall.floor}
                {stall.openTime && ` · ${stall.openTime}–${stall.closeTime}`}
              </p>
            </div>
          </div>

          {/* Table badge */}
          <div className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-xl text-xs font-[800]">
            {tableLabel}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const meta  = cat !== "ALL" ? PRODUCT_CATEGORY_META[cat as ProductCategory] : null;
            const count = cat === "ALL" ? products.length : products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[700]
                  whitespace-nowrap border transition-all shrink-0
                  ${activeCategory === cat
                    ? "bg-white text-[#1e3d1f] border-white shadow-sm"
                    : "bg-white/15 text-white border-white/20 hover:bg-white/25"
                  }`}
              >
                {meta && <span>{meta.emoji}</span>}
                <span>{meta ? meta.label : "Barchasi"}</span>
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">

        {/* Guest name (optional) */}
        <div className="flex items-center gap-2 bg-white border border-[#f0ede8] rounded-2xl px-4 py-3">
          <span className="text-sm text-[#637063]">👤</span>
          <input
            className="flex-1 text-sm bg-transparent outline-none text-[#283028] placeholder-[#9daa9e] font-[500]"
            placeholder="Ismingiz (ixtiyoriy)..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[#9daa9e]">
            <Info className="w-10 h-10 stroke-[1.2]" />
            <p className="text-sm font-[600]">Bu kategoriyada mahsulot yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const catMeta   = PRODUCT_CATEGORY_META[p.category];
              const cartItem  = cart.find((i) => i.product.id === p.id);
              const isEmpty   = p.stock <= 0;
              const emoji     = p.name.match(/^\p{Emoji}/u)?.[0] ?? catMeta.emoji;
              const cleanName = p.name.replace(/^\p{Emoji}\s*/u, "");

              return (
                <motion.div
                  key={p.id}
                  layout
                  className={`bg-white rounded-2xl border overflow-hidden transition-all
                    ${isEmpty ? "opacity-50 border-[#f0ede8]" : "border-[#f0ede8] hover:border-[#b8d9ba] hover:shadow-sm"}`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Emoji thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-[#f7f5f2] border border-[#f0ede8]
                                    flex items-center justify-center text-2xl shrink-0">
                      {emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-[700] text-[#1e3d1f] leading-tight">{cleanName}</p>
                      {p.description && (
                        <p className="text-[11px] text-[#637063] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-[800] text-[#1e3d1f] font-mono">
                          {fmt(p.price)}
                          <span className="text-xs text-[#637063] font-[600] ml-1">so'm</span>
                        </span>
                        {p.prepTime != null && p.prepTime > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-[#637063]">
                            <Clock className="w-3 h-3" />{p.prepTime} min
                          </span>
                        )}
                        {isEmpty && (
                          <span className="text-[10px] text-red-500 font-[700] bg-red-50
                                           px-2 py-0.5 rounded-full border border-red-100">
                            Tugagan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add/qty control */}
                    <div className="shrink-0">
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            className="w-8 h-8 rounded-full bg-[#f0ede8] border border-[#dedad3]
                                       flex items-center justify-center text-[#1e3d1f] font-[800]
                                       active:scale-90 transition-all"
                          >
                            {cartItem.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                          </button>
                          <span className="w-6 text-center text-sm font-[800] text-[#1e3d1f]">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(p)}
                            disabled={isEmpty}
                            className="w-8 h-8 rounded-full bg-[#1e3d1f] flex items-center
                                       justify-center text-white active:scale-90 transition-all
                                       disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p)}
                          disabled={isEmpty}
                          className="w-9 h-9 rounded-full bg-[#1e3d1f] flex items-center
                                     justify-center text-white shadow-sm active:scale-90
                                     transition-all disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note field when in cart */}
                  {cartItem && (
                    <div className="px-4 pb-3">
                      <input
                        className="w-full text-[11px] px-3 py-2 rounded-xl bg-[#f7f5f2]
                                   border border-[#f0ede8] placeholder-[#c4ccc4]
                                   focus:outline-none focus:border-[#4d8751] transition-colors"
                        placeholder="Izoh (masalan: o'tkir qilmang, sous ko'p)..."
                        value={cartItem.note}
                        onChange={(e) => updateNote(p.id, e.target.value)}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating cart button ── */}
      <AnimatePresence>
        {totalItems > 0 && !cartOpen && (
          <motion.button
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                       flex items-center gap-3 px-6 py-3.5 rounded-2xl
                       bg-[#1e3d1f] text-white shadow-2xl
                       shadow-[#1e3d1f]/40 border border-[#2d5230]
                       font-[800] text-sm active:scale-95 transition-all"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            <span>{totalItems} ta mahsulot</span>
            <span className="w-px h-4 bg-white/20" />
            <span className="font-mono text-emerald-300">{fmt(totalAmount)} so'm</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Cart bottom sheet ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl
                         shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[#dedad3]" />
              </div>

              {/* Cart header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-[#f0ede8]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4.5 h-4.5 text-[#4d8751]" />
                  <span className="text-base font-[800] text-[#1e3d1f]">Savatcha</span>
                  <span className="w-6 h-6 rounded-full bg-[#1e3d1f] text-white text-[11px]
                                   font-[800] flex items-center justify-center">
                    {totalItems}
                  </span>
                </div>
                <button onClick={() => setCartOpen(false)}
                  className="text-[#637063] hover:text-[#1e3d1f] font-[700] text-sm">
                  Yopish
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-[#f7f5f2] rounded-xl border border-[#f0ede8]">
                    <span className="text-xl shrink-0">
                      {item.product.name.match(/^\p{Emoji}/u)?.[0]
                        ?? PRODUCT_CATEGORY_META[item.product.category].emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-[700] text-[#1e3d1f] truncate">
                        {item.product.name.replace(/^\p{Emoji}\s*/u, "")}
                      </p>
                      <p className="text-[11px] text-[#637063]">
                        {fmt(item.product.price)} × {item.quantity} ={" "}
                        <span className="font-[700] text-[#1e3d1f]">
                          {fmt(item.product.price * item.quantity)} so'm
                        </span>
                      </p>
                      {item.note && (
                        <p className="text-[10px] text-amber-600 italic mt-0.5">"{item.note}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => updateQty(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#dedad3] flex items-center justify-center
                                   text-[#1e3d1f] active:scale-90 transition-all">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-[800] text-[#1e3d1f]">
                        {item.quantity}
                      </span>
                      <button onClick={() => addToCart(item.product)}
                        className="w-7 h-7 rounded-lg bg-[#1e3d1f] flex items-center justify-center
                                   text-white active:scale-90 transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary + Submit */}
              <div className="px-5 py-4 border-t border-[#f0ede8] space-y-3 bg-[#f7f5f2]">
                {/* Table info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#637063] font-[600]">📍 {tableLabel} · {stall.name}</span>
                  <span className="text-lg font-[800] text-[#1e3d1f] font-mono">
                    {fmt(totalAmount)} so'm
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100
                                   rounded-xl text-xs text-red-700 font-[700]">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0}
                  className="w-full py-4 rounded-2xl bg-[#1e3d1f] text-white font-[800] text-base
                             flex items-center justify-center gap-2 shadow-lg
                             active:scale-[.98] transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Yuborilmoqda...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Buyurtma yuborish</>
                  )}
                </button>

                <p className="text-[10px] text-[#9daa9e] text-center leading-relaxed">
                  Buyurtma ofitsiantga va oshpazga avtomatik yuboriladi
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

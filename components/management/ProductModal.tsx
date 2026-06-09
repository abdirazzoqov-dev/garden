"use client";

import { X, Package, DollarSign, Layers, Clock, Tag, ImageIcon, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import type { Stall, Product, ProductFormData, ModalMode, ProductCategory } from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";

interface ProductModalProps {
  mode: ModalMode;
  product?: Product | null;
  stalls: Stall[];
  onSave: (data: ProductFormData) => void;
  onClose: () => void;
}

const EMPTY: ProductFormData = {
  name: "", category: "FOOD", price: 0, costPrice: 0,
  stock: 0, minStockAlert: 5, unit: "dona", prepTime: 0,
  isAvailable: true, stallId: "", description: "",
};

const CATEGORIES: ProductCategory[] = ["FOOD","DRINK","DESSERT","SNACK","TEA","HOOKAH","TICKET","SOUVENIR","OTHER"];
const UNITS = ["dona", "porsiya", "stakan", "litr", "kg", "piyola", "set"];

// Popular food emojis organized by category
const EMOJI_SETS: Record<string, string[]> = {
  FOOD:     ["🍔","🌯","🍕","🍣","🍜","🥗","🍗","🥩","🍖","🌮","🥪","🥘","🍛","🫕","🥫"],
  DRINK:    ["🥤","🧃","🍵","☕","🧋","🥛","🍺","🍹","🥂","🍶","🧊","💧","🍷","🫖","🍸"],
  DESSERT:  ["🍦","🧁","🎂","🍰","🍩","🍪","🍫","🍬","🍭","🍮","🧇","🥐","🍯","🧆","🍡"],
  SNACK:    ["🍿","🥜","🧀","🥨","🫘","🌰","🍟","🥔","🫓","🥙","🧂","🫙","🥚","🥓","🍱"],
  TEA:      ["🫖","🍵","🧋","🌿","🌸","🍃","🫗","🥢","🪷","🌺","🍯","🫚","🌾","🍂","🍀"],
  HOOKAH:   ["💨","🌬️","💭","🫧","🌪️","✨","🕯️","🌙","⭐","🌟","💫","🔥","🌊","🎋","🪔"],
  TICKET:   ["🎫","🎟️","🎪","🎡","🎢","🎠","🎭","🎨","🎬","🎤","🎮","🏆","🥇","🎯","🎰"],
  SOUVENIR: ["🎁","🛍️","🪆","🧸","🪅","🎀","🏷️","📦","🪄","🎊","🎈","🧿","🪬","🖼️","🗿"],
  OTHER:    ["📦","🛒","💼","🗂️","📋","🔧","⚙️","🛠️","🏪","🏬","🏭","🗃️","📌","🔖","🏷️"],
};

export default function ProductModal({ mode, product, stalls, onSave, onClose }: ProductModalProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name, category: product.category,
        price: product.price, costPrice: product.costPrice ?? 0,
        stock: product.stock, minStockAlert: product.minStockAlert,
        unit: product.unit ?? "dona", prepTime: product.prepTime ?? 0,
        isAvailable: product.isAvailable, stallId: product.stallId,
        description: product.description ?? "",
      });
      // Extract emoji from name if present
      const firstChar = product.name.trim().charAt(0);
      if (/\p{Emoji}/u.test(firstChar)) setSelectedEmoji(firstChar);
      else setSelectedEmoji("");
    } else {
      setForm({ ...EMPTY, stallId: stalls[0]?.id ?? "" });
      setSelectedEmoji("");
    }
    setErrors({});
  }, [mode, product, stalls]);

  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name    = "Mahsulot nomi kiritilmadi";
    if (!form.stallId)      e.stallId = "Rastani tanlang";
    if (form.price <= 0)    e.price   = "Narx 0 dan katta bo'lishi kerak";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    // Prepend emoji to name if selected and not already there
    const cleanName = form.name.trim().replace(/^\p{Emoji}\s*/u, "");
    const finalName = selectedEmoji ? `${selectedEmoji} ${cleanName}` : cleanName;
    if (validate()) onSave({ ...form, name: finalName });
  };

  const margin = form.costPrice > 0
    ? Math.round(((form.price - form.costPrice) / form.price) * 100)
    : null;

  const emojiList = EMOJI_SETS[form.category] ?? EMOJI_SETS.OTHER;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,26,11,.72)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: .93, y: 24, opacity: 0 }}
          animate={{ scale: 1,   y: 0,  opacity: 1 }}
          exit={{    scale: .93, y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-[#1e3d1f] via-[#4d8751] to-[#91c494]" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-3">
              {selectedEmoji ? (
                <div className="w-9 h-9 rounded-xl bg-[#d8edda] flex items-center justify-center text-xl">
                  {selectedEmoji}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#d8edda] flex items-center justify-center">
                  <Package className="w-4.5 h-4.5 text-[#1e3d1f]" />
                </div>
              )}
              <div>
                <h3 className="text-base font-[800] text-[#1e3d1f]">
                  {mode === "create" ? "Yangi mahsulot qo'shish" : "Mahsulotni tahrirlash"}
                </h3>
                <p className="text-[11px] text-[#637063]">
                  {mode === "edit" && product?.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[72vh] overflow-y-auto">

            {/* Stall */}
            <div className="space-y-1.5">
              <label className="section-label">Rasta *</label>
              <select className={`input ${errors.stallId ? "border-red-400" : ""}`}
                value={form.stallId} onChange={(e) => set("stallId", e.target.value)}>
                <option value="">— Rastani tanlang —</option>
                {stalls.filter(s => s.status === "ACTIVE").map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.stallId && <p className="text-xs text-red-500">{errors.stallId}</p>}
            </div>

            {/* Name + Emoji picker */}
            <div className="space-y-1.5">
              <label className="section-label">Mahsulot nomi *</label>
              <div className="flex gap-2">
                {/* Emoji button */}
                <div className="relative">
                  <button type="button"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    className={`w-11 h-11 rounded-xl border-2 text-xl flex items-center justify-center transition-all
                      ${showEmojiPicker ? "border-[#4d8751] bg-[#eef7ef]" : "border-[#dedad3] bg-[#f7f5f2] hover:border-[#4d8751]"}`}
                  >
                    {selectedEmoji || <Smile className="w-4 h-4 text-[#9daa9e]" />}
                  </button>

                  {/* Emoji grid */}
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-12 z-10 bg-white border border-[#dedad3] rounded-2xl shadow-lg p-3 w-64">
                      <p className="text-[10px] font-[700] text-[#9daa9e] uppercase tracking-wide mb-2">
                        {PRODUCT_CATEGORY_META[form.category]?.label ?? "Kategoriya"} emojilar
                      </p>
                      <div className="grid grid-cols-5 gap-1">
                        {/* Clear option */}
                        <button type="button"
                          onClick={() => { setSelectedEmoji(""); setShowEmojiPicker(false); }}
                          className="w-9 h-9 rounded-lg border border-[#f0ede8] flex items-center justify-center text-[10px] font-[700] text-[#9daa9e] hover:bg-[#f0ede8]">
                          ✕
                        </button>
                        {emojiList.map((em) => (
                          <button key={em} type="button"
                            onClick={() => { setSelectedEmoji(em); setShowEmojiPicker(false); }}
                            className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:bg-[#eef7ef]
                              ${selectedEmoji === em ? "bg-[#d8edda] ring-2 ring-[#4d8751]" : ""}`}>
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Name input */}
                <input
                  className={`input flex-1 ${errors.name ? "border-red-400" : ""}`}
                  placeholder="masalan: Ko'k choy (Chinni)"
                  value={form.name.replace(/^\p{Emoji}\s*/u, "")}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              {selectedEmoji && (
                <p className="text-[11px] text-[#4d8751] font-[600]">
                  Ko'rinish: <span className="text-base">{selectedEmoji}</span> {form.name.replace(/^\p{Emoji}\s*/u, "")}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Kategoriya
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => {
                  const m = PRODUCT_CATEGORY_META[c];
                  return (
                    <button key={c} type="button" onClick={() => set("category", c)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-[700] transition-all
                        ${form.category === c ? "bg-[#1e3d1f] border-[#1e3d1f] text-white" : "border-[#f0ede8] text-[#637063] hover:border-[#4d8751]"}`}>
                      <span>{m.emoji}</span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price + Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="section-label flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" /> Sotuv narxi * (so'm)
                </label>
                <input type="number" min={0} className={`input ${errors.price ? "border-red-400" : ""}`}
                  placeholder="0" value={form.price || ""}
                  onChange={(e) => set("price", Number(e.target.value))} />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Tannarx (so'm)</label>
                <input type="number" min={0} className="input" placeholder="0"
                  value={form.costPrice || ""}
                  onChange={(e) => set("costPrice", Number(e.target.value))} />
              </div>
            </div>

            {/* Margin indicator */}
            {margin !== null && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-[700]
                ${margin >= 40 ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : margin >= 20 ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-red-50 text-red-700 border border-red-100"}`}>
                <span>Foyda marjasi: {margin}%</span>
                <span>{margin >= 40 ? "✅ Yaxshi" : margin >= 20 ? "⚠️ O'rtacha" : "❌ Kam"}</span>
              </div>
            )}

            {/* Stock + Min */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="section-label flex items-center gap-1.5">
                  <Layers className="w-3 h-3" /> Zaxira
                </label>
                <input type="number" min={0} className="input" placeholder="0"
                  value={form.stock || ""} onChange={(e) => set("stock", Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Minimal chegara</label>
                <input type="number" min={1} className="input" placeholder="5"
                  value={form.minStockAlert || ""}
                  onChange={(e) => set("minStockAlert", Number(e.target.value))} />
              </div>
            </div>

            {/* Unit + Prep time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="section-label">O'lchov birligi</label>
                <select className="input" value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="section-label flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Tayyorlash (min)
                </label>
                <input type="number" min={0} max={120} className="input" placeholder="0"
                  value={form.prepTime || ""}
                  onChange={(e) => set("prepTime", Number(e.target.value))} />
              </div>
            </div>

            {/* Available toggle */}
            <div className="flex items-center justify-between p-3 bg-[#f7f5f2] rounded-xl border border-[#f0ede8]">
              <div>
                <p className="text-sm font-[700] text-[#1e3d1f]">Sotuvda mavjud</p>
                <p className="text-[11px] text-[#637063]">POS kassada ko'rinadi</p>
              </div>
              <button type="button" onClick={() => set("isAvailable", !form.isAvailable)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200
                  ${form.isAvailable ? "bg-[#1e3d1f]" : "bg-[#c4ccc4]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
                  ${form.isAvailable ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="section-label">Tavsif (ixtiyoriy)</label>
              <textarea className="input resize-none" rows={2}
                placeholder="Mahsulot haqida qisqa ma'lumot..."
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-[#f0ede8]">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Bekor</button>
              <button type="submit" className="btn btn-primary flex-1">
                {mode === "create" ? "Qo'shish" : "Saqlash"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

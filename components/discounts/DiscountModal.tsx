"use client";

import { X, Tag, Percent, DollarSign, Gift, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import type {
  Discount, DiscountFormData, DiscountType,
  DiscountTarget, DiscountStatus, ModalMode, Stall,
} from "../types";
import { PRODUCT_CATEGORY_META } from "../constants";

interface DiscountModalProps {
  mode: ModalMode;
  discount?: Discount | null;
  stalls: Stall[];
  onSave: (data: DiscountFormData) => void;
  onClose: () => void;
}

const EMPTY: DiscountFormData = {
  name: "", code: "", type: "PERCENTAGE", status: "ACTIVE",
  value: 10, minOrderAmount: 0, maxUsageCount: 0,
  buyQty: 2, getQty: 1,
  target: "ALL", stallId: "", categoryTarget: "", productId: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  description: "",
};

const TYPE_OPTIONS: { id: DiscountType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "PERCENTAGE",  label: "% Chegirma",    icon: <Percent     className="w-4 h-4" />, desc: "Umumiy summaning foizi" },
  { id: "FIXED_AMOUNT",label: "Sobit chegirma", icon: <DollarSign  className="w-4 h-4" />, desc: "Belgilangan so'm miqdori" },
  { id: "BUY_X_GET_Y", label: "N ta ol, bepul", icon: <Gift        className="w-4 h-4" />, desc: "X ta olsang Y ta bepul" },
];

const TARGET_OPTIONS: { id: DiscountTarget; label: string }[] = [
  { id: "ALL",      label: "Barcha buyurtmalar"   },
  { id: "STALL",    label: "Faqat bitta rasta"     },
  { id: "CATEGORY", label: "Faqat bitta kategoriya"},
];

const STATUS_OPTIONS: { id: DiscountStatus; label: string; cls: string }[] = [
  { id: "ACTIVE",    label: "Faol",       cls: "border-emerald-300 hover:bg-emerald-500 text-emerald-700" },
  { id: "INACTIVE",  label: "Nofaol",     cls: "border-slate-300 hover:bg-slate-500 text-slate-600"       },
  { id: "SCHEDULED", label: "Rejalashtirilgan", cls: "border-blue-300 hover:bg-blue-500 text-blue-700"    },
];

const CATEGORY_OPTIONS = Object.entries(PRODUCT_CATEGORY_META).map(([k, v]) => ({ id: k, label: v.label, emoji: v.emoji }));

export default function DiscountModal({ mode, discount, stalls, onSave, onClose }: DiscountModalProps) {
  const [form, setForm] = useState<DiscountFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof DiscountFormData, string>>>({});

  useEffect(() => {
    if (mode === "edit" && discount) {
      setForm({
        name:           discount.name,
        code:           discount.code           ?? "",
        type:           discount.type,
        status:         discount.status,
        value:          discount.value,
        minOrderAmount: discount.minOrderAmount ?? 0,
        maxUsageCount:  discount.maxUsageCount  ?? 0,
        buyQty:         discount.buyQty         ?? 2,
        getQty:         discount.getQty         ?? 1,
        target:         discount.target,
        stallId:        discount.stallId        ?? "",
        categoryTarget: discount.categoryTarget ?? "",
        productId:      discount.productId      ?? "",
        startDate:      discount.startDate      ?? "",
        endDate:        discount.endDate        ?? "",
        description:    discount.description    ?? "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [mode, discount]);

  const set = <K extends keyof DiscountFormData>(k: K, v: DiscountFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Chegirma nomi kiritilmadi";
    if (form.type !== "BUY_X_GET_Y" && form.value <= 0) e.value = "Chegirma miqdori 0 dan katta bo'lishi kerak";
    if (form.type === "PERCENTAGE" && form.value > 100) e.value = "Foiz 100 dan oshmasin";
    if (form.target === "STALL" && !form.stallId) e.stallId = "Rastani tanlang";
    if (form.target === "CATEGORY" && !form.categoryTarget) e.categoryTarget = "Kategoriyani tanlang";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSave(form);
  };

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
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: .93, y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Tag className="w-4.5 h-4.5 text-violet-700" />
              </div>
              <div>
                <h3 className="text-base font-[800] text-[#1e3d1f]">
                  {mode === "create" ? "Yangi chegirma yaratish" : "Chegirmani tahrirlash"}
                </h3>
                <p className="text-[11px] text-[#637063]">{mode === "edit" ? discount?.name : "Aksiya yoki promo-kod"}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="section-label">Chegirma nomi *</label>
              <input className={`input ${errors.name ? "border-red-400" : ""}`}
                placeholder="masalan: Kechki 20% aksiya"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Promo code */}
            <div className="space-y-1.5">
              <label className="section-label">Promo-kod (ixtiyoriy)</label>
              <input className="input font-mono uppercase"
                placeholder="masalan: KECH20"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())} />
              <p className="text-[10px] text-[#9daa9e]">Kassada qo'lda kiritish uchun</p>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="section-label">Chegirma turi *</label>
              <div className="grid grid-cols-1 gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <button key={t.id} type="button" onClick={() => set("type", t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                      ${form.type === t.id
                        ? "bg-violet-50 border-violet-500 text-violet-800"
                        : "border-[#f0ede8] text-[#637063] hover:border-violet-300"
                      }`}>
                    <div className={`p-2 rounded-lg ${form.type === t.id ? "bg-violet-500 text-white" : "bg-[#f0ede8] text-[#637063]"}`}>
                      {t.icon}
                    </div>
                    <div>
                      <p className="text-sm font-[700]">{t.label}</p>
                      <p className="text-[11px] opacity-70">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Value based on type */}
            {form.type === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <label className="section-label">Chegirma foizi (%) *</label>
                <div className="relative">
                  <input type="number" min={1} max={100} className={`input pr-10 ${errors.value ? "border-red-400" : ""}`}
                    placeholder="10" value={form.value || ""}
                    onChange={(e) => set("value", Number(e.target.value))} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9daa9e] font-[700]">%</span>
                </div>
                {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
              </div>
            )}
            {form.type === "FIXED_AMOUNT" && (
              <div className="space-y-1.5">
                <label className="section-label">Chegirma miqdori (so'm) *</label>
                <input type="number" min={1} className={`input ${errors.value ? "border-red-400" : ""}`}
                  placeholder="10000" value={form.value || ""}
                  onChange={(e) => set("value", Number(e.target.value))} />
                {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
              </div>
            )}
            {form.type === "BUY_X_GET_Y" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="section-label">Sotib olish soni</label>
                  <input type="number" min={1} className="input"
                    value={form.buyQty || ""} onChange={(e) => set("buyQty", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <label className="section-label">Bepul olish soni</label>
                  <input type="number" min={1} className="input"
                    value={form.getQty || ""} onChange={(e) => set("getQty", Number(e.target.value))} />
                </div>
              </div>
            )}

            {/* Target */}
            <div className="space-y-1.5">
              <label className="section-label">Qaysi buyurtmalarga qo'llansin?</label>
              <div className="grid grid-cols-3 gap-2">
                {TARGET_OPTIONS.map((t) => (
                  <button key={t.id} type="button" onClick={() => set("target", t.id)}
                    className={`py-2.5 px-2 rounded-xl border-2 text-xs font-[700] transition-all text-center
                      ${form.target === t.id ? "bg-[#1e3d1f] border-[#1e3d1f] text-white" : "border-[#f0ede8] text-[#637063] hover:border-[#4d8751]"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stall target */}
            {form.target === "STALL" && (
              <div className="space-y-1.5">
                <label className="section-label">Rasta *</label>
                <select className={`input ${errors.stallId ? "border-red-400" : ""}`}
                  value={form.stallId} onChange={(e) => set("stallId", e.target.value)}>
                  <option value="">— Rastani tanlang —</option>
                  {stalls.filter((s) => s.status === "ACTIVE").map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.stallId && <p className="text-xs text-red-500">{errors.stallId}</p>}
              </div>
            )}

            {/* Category target */}
            {form.target === "CATEGORY" && (
              <div className="space-y-1.5">
                <label className="section-label">Kategoriya *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((c) => (
                    <button key={c.id} type="button" onClick={() => set("categoryTarget", c.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-[700] transition-all
                        ${form.categoryTarget === c.id ? "bg-[#1e3d1f] border-[#1e3d1f] text-white" : "border-[#f0ede8] text-[#637063] hover:border-[#4d8751]"}`}>
                      <span>{c.emoji}</span><span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
                {errors.categoryTarget && <p className="text-xs text-red-500">{errors.categoryTarget}</p>}
              </div>
            )}

            {/* Min order + max usage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="section-label">Minimal buyurtma (so'm)</label>
                <input type="number" min={0} className="input" placeholder="0"
                  value={form.minOrderAmount || ""}
                  onChange={(e) => set("minOrderAmount", Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Maks. foydalanish soni</label>
                <input type="number" min={0} className="input" placeholder="Cheksiz"
                  value={form.maxUsageCount || ""}
                  onChange={(e) => set("maxUsageCount", Number(e.target.value))} />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="section-label">Boshlanish sanasi</label>
                <input type="date" className="input" value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Tugash sanasi</label>
                <input type="date" className="input" value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="section-label">Holat</label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s.id} type="button" onClick={() => set("status", s.id)}
                    className={`flex-1 py-2 rounded-xl border-2 text-xs font-[700] transition-all
                      ${form.status === s.id
                        ? s.id === "ACTIVE" ? "bg-emerald-600 border-emerald-600 text-white"
                          : s.id === "INACTIVE" ? "bg-slate-600 border-slate-600 text-white"
                          : "bg-blue-600 border-blue-600 text-white"
                        : `${s.cls} bg-white`
                      }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="section-label">Tavsif (ixtiyoriy)</label>
              <textarea className="input resize-none" rows={2}
                placeholder="Chegirma haqida qisqa izoh..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-[#f0ede8]">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Bekor</button>
              <button type="submit" className="btn flex-1 bg-violet-600 hover:bg-violet-700 text-white border-0">
                {mode === "create" ? "Yaratish" : "Saqlash"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

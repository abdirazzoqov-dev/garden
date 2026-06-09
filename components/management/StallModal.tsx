"use client";

import { X, Store, Clock, MapPin, LayoutGrid, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import type { Stall, StallFormData, ModalMode, StallType, StallStatus } from "../types";
import { STALL_TYPE_META } from "../constants";

interface StallModalProps {
  mode: ModalMode;
  stall?: Stall | null;
  onSave: (data: StallFormData) => void;
  onClose: () => void;
}

const EMPTY: StallFormData = {
  name: "", type: "FASTFOOD", status: "ACTIVE",
  description: "", openTime: "09:00", closeTime: "22:00",
  tableCount: 0, floor: "",
};

const STALL_TYPES: StallType[] = ["FASTFOOD", "TEAHOUSE", "CAFE", "STALL", "ATTRACTION", "SERVICE"];
const STALL_STATUSES: StallStatus[] = ["ACTIVE", "CLOSED", "MAINTENANCE"];
const STATUS_LABELS: Record<StallStatus, string> = { ACTIVE: "Faol", CLOSED: "Yopiq", MAINTENANCE: "Ta'mirda" };

export default function StallModal({ mode, stall, onSave, onClose }: StallModalProps) {
  const [form, setForm] = useState<StallFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof StallFormData, string>>>({});

  useEffect(() => {
    if (mode === "edit" && stall) {
      setForm({
        name:        stall.name,
        type:        stall.type,
        status:      stall.status,
        description: stall.description  ?? "",
        openTime:    stall.openTime     ?? "09:00",
        closeTime:   stall.closeTime    ?? "22:00",
        tableCount:  stall.tableCount   ?? 0,
        floor:       stall.floor        ?? "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [mode, stall]);

  const set = <K extends keyof StallFormData>(k: K, v: StallFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name  = "Rasta nomi kiritilmadi";
    if (!form.floor.trim()) e.floor = "Joylashuv kiritilmadi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSave(form);
  };

  const needsTable = form.type === "TEAHOUSE" || form.type === "CAFE";

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
          {/* Accent */}
          <div className="h-1 bg-gradient-to-r from-[#1e3d1f] via-[#4d8751] to-[#91c494]" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d8edda] flex items-center justify-center">
                <Store className="w-4.5 h-4.5 text-[#1e3d1f]" />
              </div>
              <div>
                <h3 className="text-base font-[800] text-[#1e3d1f]">
                  {mode === "create" ? "Yangi rasta qo'shish" : "Rastani tahrirlash"}
                </h3>
                <p className="text-[11px] text-[#637063]">
                  {mode === "create" ? "Barcha maydonlarni to'ldiring" : stall?.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Rasta nomi *
              </label>
              <input
                className={`input ${errors.name ? "border-red-400" : ""}`}
                placeholder="masalan: Shimoliy Choyxona"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="section-label">Rasta turi *</label>
              <div className="grid grid-cols-3 gap-2">
                {STALL_TYPES.map((t) => {
                  const m = STALL_TYPE_META[t];
                  return (
                    <button
                      key={t} type="button"
                      onClick={() => set("type", t)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-[700]
                        ${form.type === t
                          ? "bg-[#1e3d1f] border-[#1e3d1f] text-white"
                          : "border-[#f0ede8] text-[#637063] hover:border-[#4d8751]"
                        }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="section-label">Holat</label>
              <div className="flex gap-2">
                {STALL_STATUSES.map((s) => (
                  <button key={s} type="button"
                    onClick={() => set("status", s)}
                    className={`flex-1 py-2 rounded-xl border-2 text-xs font-[700] transition-all
                      ${form.status === s
                        ? s === "ACTIVE" ? "bg-emerald-600 border-emerald-600 text-white"
                          : s === "CLOSED" ? "bg-slate-600 border-slate-600 text-white"
                          : "bg-amber-500 border-amber-500 text-white"
                        : "border-[#f0ede8] text-[#637063] hover:border-[#9daa9e]"
                      }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Joylashuv *
              </label>
              <input
                className={`input ${errors.floor ? "border-red-400" : ""}`}
                placeholder="masalan: Asosiy maydon, Ko'l bo'yi"
                value={form.floor}
                onChange={(e) => set("floor", e.target.value)}
              />
              {errors.floor && <p className="text-xs text-red-500">{errors.floor}</p>}
            </div>

            {/* Working hours */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Ish vaqti
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-[#9daa9e] mb-1">Ochilish</p>
                  <input type="time" className="input" value={form.openTime}
                    onChange={(e) => set("openTime", e.target.value)} />
                </div>
                <span className="text-[#9daa9e] font-[700] mt-4">—</span>
                <div className="flex-1">
                  <p className="text-[10px] text-[#9daa9e] mb-1">Yopilish</p>
                  <input type="time" className="input" value={form.closeTime}
                    onChange={(e) => set("closeTime", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Table count (for teahouse/cafe) */}
            {needsTable && (
              <div className="space-y-1.5">
                <label className="section-label flex items-center gap-1.5">
                  <LayoutGrid className="w-3 h-3" /> Stollar soni
                </label>
                <input
                  type="number" min={0} max={200} className="input"
                  placeholder="0"
                  value={form.tableCount || ""}
                  onChange={(e) => set("tableCount", Number(e.target.value))}
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <label className="section-label">Tavsif (ixtiyoriy)</label>
              <textarea
                className="input resize-none" rows={2}
                placeholder="Rasta haqida qisqa ma'lumot..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-[#f0ede8]">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Bekor qilish
              </button>
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

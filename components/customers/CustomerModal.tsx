"use client";

import { X, UserPlus, Phone, Mail, Calendar, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import type { Customer, CustomerFormData, ModalMode } from "../types";

interface CustomerModalProps {
  mode: ModalMode;
  customer?: Customer | null;
  onSave: (data: CustomerFormData) => void;
  onClose: () => void;
}

const EMPTY: CustomerFormData = {
  name: "", phone: "", email: "", birthday: "", notes: "",
};

export default function CustomerModal({ mode, customer, onSave, onClose }: CustomerModalProps) {
  const [form,   setForm]   = useState<CustomerFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  useEffect(() => {
    if (mode === "edit" && customer) {
      setForm({
        name:     customer.name,
        phone:    customer.phone,
        email:    customer.email    ?? "",
        birthday: customer.birthday ?? "",
        notes:    customer.notes    ?? "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [mode, customer]);

  const set = <K extends keyof CustomerFormData>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name  = "Ism kiritilmadi";
    if (!form.phone.trim()) e.phone = "Telefon kiritilmadi";
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-500 to-purple-500" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0ede8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-4.5 h-4.5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-base font-[800] text-[#1e3d1f]">
                  {mode === "create" ? "Yangi mijoz qo'shish" : "Mijoz ma'lumotlarini tahrirlash"}
                </h3>
                <p className="text-[11px] text-[#637063]">
                  {mode === "edit" ? customer?.name : "Loyalti tizimiga qo'shish"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="section-label">To'liq ism *</label>
              <input className={`input ${errors.name ? "border-red-400" : ""}`}
                placeholder="masalan: Akbar Toshmatov"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Telefon *
              </label>
              <input className={`input ${errors.phone ? "border-red-400" : ""}`}
                placeholder="+998 90 123 4567"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email (ixtiyoriy)
              </label>
              <input type="email" className="input"
                placeholder="mijoz@mail.uz"
                value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>

            {/* Birthday */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Tug'ilgan kun (ixtiyoriy)
              </label>
              <input type="date" className="input"
                value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="section-label flex items-center gap-1.5">
                <StickyNote className="w-3 h-3" /> Izoh (ixtiyoriy)
              </label>
              <textarea className="input resize-none" rows={2}
                placeholder="Mijoz haqida maxsus ma'lumot..."
                value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-[#f0ede8]">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Bekor</button>
              <button type="submit"
                className="btn flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0">
                {mode === "create" ? "Qo'shish" : "Saqlash"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

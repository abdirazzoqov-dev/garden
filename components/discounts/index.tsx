"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight,
  TrendingDown, Percent, DollarSign, Gift, CheckCircle2, Clock,
} from "lucide-react";
import DiscountModal from "./DiscountModal";
import type { Discount, DiscountFormData, ModalMode, Stall } from "../types";
import { STALL_TYPE_META } from "../constants";
import { formatNumber, getUniqueId } from "../utils";

interface DiscountsTabProps {
  discounts: Discount[];
  stalls: Stall[];
  onAdd:    (d: Discount)    => void;
  onUpdate: (d: Discount)    => void;
  onDelete: (id: string)     => void;
  onToggle: (id: string)     => void;
}

const TYPE_META = {
  PERCENTAGE:   { label: "% Chegirma",    icon: <Percent    className="w-3.5 h-3.5" />, cls: "bg-violet-100 text-violet-700 border-violet-200" },
  FIXED_AMOUNT: { label: "Sobit chegirma", icon: <DollarSign className="w-3.5 h-3.5" />, cls: "bg-blue-100 text-blue-700 border-blue-200"       },
  BUY_X_GET_Y:  { label: "N ta — bepul",  icon: <Gift       className="w-3.5 h-3.5" />, cls: "bg-amber-100 text-amber-700 border-amber-200"     },
  FREE_ITEM:    { label: "Bepul mahsulot", icon: <Gift       className="w-3.5 h-3.5" />, cls: "bg-pink-100 text-pink-700 border-pink-200"        },
};

const STATUS_META = {
  ACTIVE:    { label: "Faol",               cls: "badge-green"  },
  INACTIVE:  { label: "Nofaol",             cls: "badge-slate"  },
  EXPIRED:   { label: "Muddati o'tgan",     cls: "badge-red"    },
  SCHEDULED: { label: "Rejalashtirilgan",   cls: "badge badge-purple" },
};

export default function DiscountsTab({ discounts, stalls, onAdd, onUpdate, onDelete, onToggle }: DiscountsTabProps) {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalMode,   setModalMode]   = useState<ModalMode>("create");
  const [editTarget,  setEditTarget]  = useState<Discount | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const openCreate = () => { setModalMode("create"); setEditTarget(null); setModalOpen(true); };
  const openEdit   = (d: Discount) => { setModalMode("edit"); setEditTarget(d); setModalOpen(true); };

  const handleSave = (data: DiscountFormData) => {
    const stallName = stalls.find((s) => s.id === data.stallId)?.name;
    if (modalMode === "edit" && editTarget) {
      onUpdate({ ...editTarget, ...data, stallName });
    } else {
      onAdd({
        id:         getUniqueId("disc"),
        ...data,
        stallName,
        usageCount: 0,
        createdAt:  new Date().toISOString().split("T")[0],
      } as Discount);
    }
    setModalOpen(false);
  };

  const filtered = filterStatus === "ALL"
    ? discounts
    : discounts.filter((d) => d.status === filterStatus);

  // Stats
  const activeCount    = discounts.filter((d) => d.status === "ACTIVE").length;
  const totalUsed      = discounts.reduce((s, d) => s + d.usageCount, 0);
  const scheduledCount = discounts.filter((d) => d.status === "SCHEDULED").length;

  return (
    <motion.div
      key="discounts"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-[800] text-[#1e3d1f] flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-violet-600" />
            Chegirmalar va Aksiyalar
          </h2>
          <p className="text-[11px] text-[#637063] mt-0.5">
            Promo-kodlar, foiz va sobit chegirmalar boshqaruvi
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-0">
          <Plus className="w-4 h-4" /> Yangi chegirma
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Faol chegirmalar",  value: activeCount,             cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Rejalashtirilgan",  value: scheduledCount,          cls: "text-blue-600",    bg: "bg-blue-50 border-blue-100"       },
          { label: "Jami ishlatilgan",  value: `${totalUsed} marta`,    cls: "text-violet-600",  bg: "bg-violet-50 border-violet-100"   },
          { label: "Jami chegirmalar",  value: discounts.length,        cls: "text-[#1e3d1f]",   bg: "bg-[#f0ede8] border-[#dedad3]"    },
        ].map((s) => (
          <div key={s.label} className={`p-3.5 rounded-2xl border ${s.bg}`}>
            <p className="text-[10px] font-[700] text-[#637063] uppercase tracking-wide">{s.label}</p>
            <p className={`text-xl font-[800] font-mono ${s.cls} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"].map((st) => {
          const count = st === "ALL" ? discounts.length : discounts.filter((d) => d.status === st).length;
          if (count === 0 && st !== "ALL") return null;
          return (
            <button key={st} onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-[700] border transition-all
                ${filterStatus === st ? "bg-[#1e3d1f] text-white border-[#1e3d1f]" : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"}`}>
              {st === "ALL" ? "Barchasi" : st === "ACTIVE" ? "Faol" : st === "INACTIVE" ? "Nofaol" : st === "SCHEDULED" ? "Rejalashtirilgan" : "Muddati o'tgan"}
              <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Discount cards grid ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-[#9daa9e]">
          <Tag className="w-10 h-10 stroke-[1.2]" />
          <p className="text-sm font-[600]">Chegirma topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((d) => {
              const typeMeta   = TYPE_META[d.type];
              const statusMeta = STATUS_META[d.status];
              const usagePct   = d.maxUsageCount ? Math.min(100, (d.usageCount / d.maxUsageCount) * 100) : 0;

              return (
                <motion.div
                  key={d.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .95 }}
                  className={`card overflow-hidden ${d.status !== "ACTIVE" ? "opacity-70" : ""}`}
                >
                  {/* Top bar */}
                  <div className={`h-1 w-full ${
                    d.status === "ACTIVE" ? "bg-gradient-to-r from-violet-500 to-purple-400"
                    : d.status === "SCHEDULED" ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                    : "bg-[#f0ede8]"
                  }`} />

                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-[800] text-[#1e3d1f] leading-tight">{d.name}</p>
                        {d.code && (
                          <code className="text-[11px] font-mono font-[700] bg-violet-100 text-violet-800 px-2 py-0.5 rounded-lg mt-1 inline-block">
                            {d.code}
                          </code>
                        )}
                      </div>
                      <span className={`badge border text-[10px] shrink-0 ${typeMeta.cls}`}>
                        {typeMeta.icon}
                        {typeMeta.label}
                      </span>
                    </div>

                    {/* Value display */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-[800] text-violet-700 leading-none">
                          {d.type === "PERCENTAGE"   ? `${d.value}%`
                           : d.type === "FIXED_AMOUNT" ? `−${formatNumber(d.value)}`
                           : `${d.buyQty}+${d.getQty}`
                          }
                        </p>
                        <p className="text-[11px] text-[#637063] font-[500] mt-0.5">
                          {d.type === "PERCENTAGE"   ? "chegirma"
                           : d.type === "FIXED_AMOUNT" ? "so'm chegirma"
                           : "ta olsang — bepul"
                          }
                        </p>
                      </div>
                      <span className={`badge ${statusMeta.cls}`}>{statusMeta.label}</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-[11px] text-[#637063]">
                      {d.stallName && (
                        <p>🏪 {d.stallName}</p>
                      )}
                      {d.minOrderAmount && d.minOrderAmount > 0 && (
                        <p>💰 Min: {formatNumber(d.minOrderAmount)} so'm dan</p>
                      )}
                      {(d.startDate || d.endDate) && (
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {d.startDate} → {d.endDate || "belgilanmagan"}
                        </p>
                      )}
                      {d.description && (
                        <p className="text-[#9daa9e] italic line-clamp-1">{d.description}</p>
                      )}
                    </div>

                    {/* Usage progress */}
                    {d.maxUsageCount && d.maxUsageCount > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#637063] font-[600]">
                          <span>Ishlatilgan: {d.usageCount}</span>
                          <span>Limit: {d.maxUsageCount}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#f0ede8] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-red-400" : usagePct >= 60 ? "bg-amber-400" : "bg-violet-400"}`}
                            style={{ width: `${usagePct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#f0ede8]">
                      {/* Toggle */}
                      <button onClick={() => onToggle(d.id)}
                        title={d.status === "ACTIVE" ? "Nofaol qilish" : "Faol qilish"}
                        className="shrink-0">
                        {d.status === "ACTIVE"
                          ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                          : <ToggleLeft  className="w-6 h-6 text-[#c4ccc4]" />
                        }
                      </button>

                      <div className="flex-1" />

                      <button onClick={() => openEdit(d)} className="btn-icon btn-icon-sm" title="Tahrirlash">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => setDeleteId(d.id)}
                        className="btn-icon btn-icon-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                        title="O'chirish">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Discount modal ── */}
      {modalOpen && (
        <DiscountModal
          mode={modalMode}
          discount={editTarget}
          stalls={stalls}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10,26,11,.72)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: .93, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .93, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-[800] text-[#1e3d1f]">Chegirma o'chirilsinmi?</p>
                  <p className="text-xs text-[#637063]">
                    «{discounts.find((d) => d.id === deleteId)?.name}» o'chib ketadi.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Bekor</button>
                <button onClick={() => { onDelete(deleteId); setDeleteId(null); }}
                  className="btn flex-1 bg-red-600 hover:bg-red-700 text-white border-0">
                  <Trash2 className="w-4 h-4" /> O'chirish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

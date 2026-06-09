"use client";

import { Plus, Pencil, Trash2, Store, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import StallModal from "./StallModal";
import type { Stall, StallFormData, ModalMode } from "../types";
import { STALL_TYPE_META, STALL_STATUS_META } from "../constants";
import { getUniqueId } from "../utils";

interface StallManagerProps {
  stalls: Stall[];
  onAdd:    (stall: Stall)    => void;
  onUpdate: (stall: Stall)    => void;
  onDelete: (stallId: string) => void;
}

export default function StallManager({ stalls, onAdd, onUpdate, onDelete }: StallManagerProps) {
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]   = useState<ModalMode>("create");
  const [editTarget, setEditTarget] = useState<Stall | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const openCreate = () => { setModalMode("create"); setEditTarget(null); setModalOpen(true); };
  const openEdit   = (s: Stall) => { setModalMode("edit"); setEditTarget(s); setModalOpen(true); };

  const handleSave = (data: StallFormData) => {
    const stall = stalls.find((s) => s.id === editTarget?.id);
    if (modalMode === "edit" && stall) {
      onUpdate({ ...stall, ...data });
    } else {
      onAdd({
        id: getUniqueId("stall"),
        ...data,
        createdAt: new Date().toISOString().split("T")[0],
      } as Stall);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) { onDelete(deleteId); setDeleteId(null); }
  };

  const filtered = filterType === "ALL"
    ? stalls
    : stalls.filter((s) => s.type === filterType);

  const types = ["ALL", ...Array.from(new Set(stalls.map((s) => s.type)))];

  // Stats
  const activeCount = stalls.filter((s) => s.status === "ACTIVE").length;
  const closedCount = stalls.filter((s) => s.status === "CLOSED").length;

  return (
    <div className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-[800] text-[#1e3d1f]">Rastalar boshqaruvi</h3>
          <p className="text-[11px] text-[#637063] mt-0.5">
            Jami {stalls.length} ta · Faol: {activeCount} · Yopiq: {closedCount}
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          Yangi rasta
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["FASTFOOD","TEAHOUSE","CAFE","STALL"] as const).map((t) => {
          const meta = STALL_TYPE_META[t];
          const count = stalls.filter((s) => s.type === t).length;
          return (
            <div key={t} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{meta.emoji}</span>
              <div>
                <p className="text-xs font-[700] text-[#1e3d1f]">{meta.label}</p>
                <p className="text-lg font-[800] text-[#1e3d1f]">{count} ta</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-[700] border transition-all
              ${filterType === t
                ? "bg-[#1e3d1f] text-white border-[#1e3d1f]"
                : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"
              }`}
          >
            {t === "ALL" ? "Barchasi" : STALL_TYPE_META[t as keyof typeof STALL_TYPE_META]?.label ?? t}
            <span className="ml-1 opacity-70">
              ({t === "ALL" ? stalls.length : stalls.filter((s) => s.type === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Stall cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((stall) => {
            const meta       = STALL_TYPE_META[stall.type];
            const statusMeta = STALL_STATUS_META[stall.status];
            const needsTable = stall.type === "TEAHOUSE" || stall.type === "CAFE";
            return (
              <motion.div
                key={stall.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: .95 }}
                transition={{ duration: .18 }}
                className={`card card-hover overflow-hidden ${stall.status !== "ACTIVE" ? "opacity-70" : ""}`}
              >
                {/* Top accent */}
                <div className={`h-1 bg-gradient-to-r ${
                  stall.type === "FASTFOOD"   ? "from-orange-400 to-amber-300"
                  : stall.type === "TEAHOUSE" ? "from-emerald-500 to-teal-400"
                  : stall.type === "CAFE"     ? "from-amber-500 to-yellow-400"
                  : stall.type === "STALL"    ? "from-purple-500 to-violet-400"
                  : stall.type === "ATTRACTION" ? "from-blue-500 to-cyan-400"
                  : "from-slate-400 to-gray-300"
                }`} />

                <div className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{meta.emoji}</span>
                      <div>
                        <p className="text-sm font-[800] text-[#1e3d1f] leading-tight">{stall.name}</p>
                        <p className={`text-[10px] font-[700] ${meta.color}`}>{meta.label}</p>
                      </div>
                    </div>
                    <span className={`badge ${statusMeta.badge}`}>{statusMeta.label}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-[#637063]">
                    {stall.floor && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{stall.floor}</span>
                      </div>
                    )}
                    {(stall.openTime || stall.closeTime) && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{stall.openTime} — {stall.closeTime}</span>
                      </div>
                    )}
                    {needsTable && stall.tableCount != null && stall.tableCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{stall.tableCount} ta stol</span>
                      </div>
                    )}
                    {stall.description && (
                      <p className="text-[11px] text-[#9daa9e] line-clamp-2 mt-1">
                        {stall.description}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openEdit(stall)}
                      className="btn btn-secondary btn-sm flex-1">
                      <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                    </button>
                    <button onClick={() => setDeleteId(stall.id)}
                      className="btn btn-danger btn-sm flex-1">
                      <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Stall modal ── */}
      {modalOpen && (
        <StallModal
          mode={modalMode}
          stall={editTarget}
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
              initial={{ scale: .93, y: 16 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: .93, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-[800] text-[#1e3d1f]">Rostdan ham o'chirilsinmi?</p>
                  <p className="text-xs text-[#637063] mt-0.5">
                    «{stalls.find((s) => s.id === deleteId)?.name}» rastasi va uning barcha mahsulotlari o'chib ketadi!
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">
                  Bekor
                </button>
                <button onClick={handleDelete}
                  className="btn flex-1 bg-red-600 hover:bg-red-700 text-white border-0">
                  <Trash2 className="w-4 h-4" /> Ha, o'chirish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
